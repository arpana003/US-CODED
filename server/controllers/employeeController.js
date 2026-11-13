import Task from '../models/Task.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import TeamMember from '../models/TeamMember.js';
import { emitSocketEvent } from '../socket.js';

// Helper: resolve teamMemberId for the authenticated user
const resolveTeamMemberId = async (user) => {
  if (user.teamMemberId) return user.teamMemberId;
  // Fall back: match by email in TeamMember collection
  const member = await TeamMember.findOne({ email: user.email });
  return member ? member._id : null;
};

// @route   GET /api/employee/dashboard
// @access  Employee
export const getMyDashboard = async (req, res) => {
  try {
    const teamMemberId = await resolveTeamMemberId(req.user);
    if (!teamMemberId) {
      return res.json({
        success: true,
        data: { totalAssigned: 0, completed: 0, pending: 0, overdue: 0, recentTasks: [], myProjects: [] },
      });
    }

    const tasks = await Task.find({ assignedTo: teamMemberId })
      .populate('project', 'name status deadline')
      .sort({ deadline: 1 });

    const now = new Date();
    const totalAssigned = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const overdue = tasks.filter(t =>
      !['Completed', 'Done'].includes(t.status) && new Date(t.deadline) < now
    ).length;
    const pending = totalAssigned - completed;
    const recentTasks = tasks.slice(0, 5);

    // Unique projects
    const projectIds = [...new Set(tasks.map(t => t.project?._id?.toString()).filter(Boolean))];
    const myProjects = await Project.find({ _id: { $in: projectIds } }).select('name status progress deadline');

    return res.json({
      success: true,
      data: {
        stats: {
          total: totalAssigned,
          completed,
          inProgress,
          overdue,
          pending,
        },
        totalAssigned,
        completed,
        inProgress,
        pending,
        overdue,
        recentTasks,
        myProjects,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/employee/tasks
// @access  Employee
export const getMyTasks = async (req, res) => {
  try {
    const teamMemberId = await resolveTeamMemberId(req.user);
    if (!teamMemberId) return res.json({ success: true, data: [] });

    const { status, priority } = req.query;
    const filter = { assignedTo: teamMemberId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('project', 'name status deadline')
      .sort({ deadline: 1 });

    return res.json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/employee/tasks/:id
// @access  Employee — only their own task
export const getMyTaskById = async (req, res) => {
  try {
    const teamMemberId = await resolveTeamMemberId(req.user);
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status deadline description')
      .populate('assignedTo', 'name email role');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    // Security: ensure this task belongs to the requesting employee
    if (!teamMemberId || task.assignedTo?._id?.toString() !== teamMemberId.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this task.' });
    }

    return res.json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/employee/tasks/:id/status
// @access  Employee — can only update status, completionNote
export const updateMyTaskStatus = async (req, res) => {
  try {
    const teamMemberId = await resolveTeamMemberId(req.user);
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (!teamMemberId || task.assignedTo?.toString() !== teamMemberId.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this task.' });
    }

    const { status, completionNote } = req.body;
    const allowedStatuses = ['To Do', 'In Progress', 'Under Review', 'Completed', 'Blocked', 'Done'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const prevStatus = task.status;
    if (status) task.status = status;
    if (completionNote !== undefined) task.completionNote = completionNote.trim();

    // Activity log entry
    task.activityLog.push({
      action: `Status changed from "${prevStatus}" to "${status || prevStatus}"`,
      by: req.user.name,
      at: new Date(),
    });

    const saved = await task.save();
    const populated = await Task.findById(saved._id)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email');

    emitSocketEvent('TASK_UPDATED', populated);
    emitSocketEvent('DASHBOARD_UPDATED', { type: 'TASK_STATUS_UPDATED', taskId: task._id });

    return res.json({ success: true, data: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/employee/tasks/:id/comment
// @access  Employee — only on their own task
export const addTaskComment = async (req, res) => {
  try {
    const teamMemberId = await resolveTeamMemberId(req.user);
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (!teamMemberId || task.assignedTo?.toString() !== teamMemberId.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to comment on this task.' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    task.comments.push({ author: req.user.name, authorId: req.user._id.toString(), text: text.trim(), createdAt: new Date() });
    task.activityLog.push({ action: `Comment added by ${req.user.name}`, by: req.user.name, at: new Date() });

    const saved = await task.save();
    const populated = await Task.findById(saved._id).populate('project', 'name status').populate('assignedTo', 'name email');

    emitSocketEvent('TASK_UPDATED', populated);

    return res.json({ success: true, data: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/employee/profile
// @access  Employee
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const teamMemberId = await resolveTeamMemberId(req.user);

    let teamMember = null;
    let taskStats = { total: 0, completed: 0, pending: 0, overdue: 0 };
    let myProjects = [];

    if (teamMemberId) {
      teamMember = await TeamMember.findById(teamMemberId).populate('projects', 'name status');
      const tasks = await Task.find({ assignedTo: teamMemberId });
      const now = new Date();
      taskStats.total = tasks.length;
      taskStats.completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;
      taskStats.overdue = tasks.filter(t => !['Completed', 'Done'].includes(t.status) && new Date(t.deadline) < now).length;
      taskStats.pending = taskStats.total - taskStats.completed;
      if (teamMember?.projects) myProjects = teamMember.projects;
    }

    return res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, designation: user.designation, avatar: user.avatar, createdAt: user.createdAt },
        teamMember,
        taskStats,
        myProjects,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/employee/profile
// @access  Employee — only name and designation
export const updateMyProfile = async (req, res) => {
  try {
    const { name, designation } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (designation !== undefined) user.designation = designation.trim();

    // Also update linked TeamMember name if present
    if (name && user.teamMemberId) {
      await TeamMember.findByIdAndUpdate(user.teamMemberId, { name: name.trim() });
    }

    await user.save();
    const updated = await User.findById(user._id).select('-password');

    return res.json({ success: true, data: updated, message: 'Profile updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


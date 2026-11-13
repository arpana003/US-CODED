import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { recalculateProjectProgress, buildProjectDigitalTwin } from '../services/digitalTwin.js';
import { emitSocketEvent } from '../socket.js';
import { invalidateCache } from '../services/aiEngine.js';

// Get tasks with optional filters: project, status, assignedTo
export const getTasks = async (req, res) => {
  try {
    const { project, status, assignedTo } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('project', 'name status progress deadline')
      .populate('assignedTo', 'name email role')
      .sort({ deadline: 1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status progress deadline')
      .populate('assignedTo', 'name email role');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new task
export const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, deadline, status, priority, issueNotes } = req.body;

    if (!title || !project || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, project reference, and deadline are required'
      });
    }

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ success: false, message: 'Referenced project does not exist' });
    }

    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      project,
      assignedTo: assignedTo || null,
      deadline,
      status: status || 'To Do',
      priority: priority || 'Medium',
      issueNotes: issueNotes ? issueNotes.trim() : ''
    });

    const savedTask = await task.save();

    // Auto-recalculate project progress % from completed tasks
    const updatedProgress = await recalculateProjectProgress(project);

    const populatedTask = await Task.findById(savedTask._id)
      .populate('project', 'name status progress deadline')
      .populate('assignedTo', 'name email role');

    // Emit live socket updates
    emitSocketEvent('TASK_CREATED', populatedTask);
    emitSocketEvent('PROJECT_PROGRESS_UPDATED', { projectId: project, progress: updatedProgress });
    emitSocketEvent('DASHBOARD_UPDATED', { type: 'TASK_CREATED', projectId: project });
    invalidateCache();

    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, deadline, status, priority, issueNotes, instructions, completionNote, comments } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const isAdmin = req.user && req.user.role === 'admin';

    // Employees cannot modify admin-controlled fields
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can use this endpoint. Use /api/employee/tasks/:id/status instead.' });
    }

    const oldProjectId = task.project.toString();
    let newProjectId = oldProjectId;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (instructions !== undefined) task.instructions = instructions.trim();
    if (project !== undefined) {
      task.project = project;
      newProjectId = project.toString();
    }
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (deadline !== undefined) task.deadline = deadline;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (issueNotes !== undefined) task.issueNotes = issueNotes.trim();
    if (completionNote !== undefined) task.completionNote = completionNote.trim();

    const savedTask = await task.save();

    // Recalculate progress for affected project(s)
    await recalculateProjectProgress(oldProjectId);
    if (newProjectId !== oldProjectId) {
      await recalculateProjectProgress(newProjectId);
    }

    const populatedTask = await Task.findById(savedTask._id)
      .populate('project', 'name status progress deadline')
      .populate('assignedTo', 'name email role');

    // Emit live socket updates
    emitSocketEvent('TASK_UPDATED', populatedTask);
    emitSocketEvent('PROJECT_PROGRESS_UPDATED', { projectId: newProjectId });
    emitSocketEvent('DASHBOARD_UPDATED', { type: 'TASK_UPDATED', taskId: task._id });
    invalidateCache();

    res.json({ success: true, data: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const projectId = task.project.toString();
    await Task.findByIdAndDelete(task._id);

    // Auto-recalculate project progress %
    const updatedProgress = await recalculateProjectProgress(projectId);

    // Emit live socket updates
    emitSocketEvent('TASK_DELETED', { id: task._id, projectId });
    emitSocketEvent('PROJECT_PROGRESS_UPDATED', { projectId, progress: updatedProgress });
    emitSocketEvent('DASHBOARD_UPDATED', { type: 'TASK_DELETED', id: task._id });
    invalidateCache();

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

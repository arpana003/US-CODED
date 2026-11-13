import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TeamMember from '../models/TeamMember.js';
import { buildProjectDigitalTwin, recalculateProjectProgress } from '../services/digitalTwin.js';
import { emitSocketEvent } from '../socket.js';
import { invalidateCache } from '../services/aiEngine.js';

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('team', 'name email role').sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('team', 'name email role');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    const { name, description, startDate, deadline, status, team } = req.body;
    if (!name || !deadline) {
      return res.status(400).json({ success: false, message: 'Name and deadline are required' });
    }

    const project = new Project({
      name,
      description: description || '',
      startDate: startDate || new Date(),
      deadline,
      status: status || 'Planning',
      progress: 0,
      team: team || []
    });

    const savedProject = await project.save();

    // If team members were assigned, update their projects[] array
    if (team && team.length > 0) {
      await TeamMember.updateMany(
        { _id: { $in: team } },
        { $addToSet: { projects: savedProject._id } }
      );
    }

    const populatedProject = await Project.findById(savedProject._id).populate('team', 'name email role');

    emitSocketEvent('PROJECT_CREATED', populatedProject);
    emitSocketEvent('DASHBOARD_UPDATED', { type: 'PROJECT_CREATED', id: savedProject._id });
    invalidateCache();

    res.status(201).json({ success: true, data: populatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update existing project
export const updateProject = async (req, res) => {
  try {
    const { name, description, startDate, deadline, status, team, progress } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (startDate !== undefined) project.startDate = startDate;
    if (deadline !== undefined) project.deadline = deadline;
    if (status !== undefined) project.status = status;
    if (progress !== undefined) project.progress = progress;

    if (team !== undefined) {
      // Remove project from previously assigned members who are no longer on the team
      const removedMembers = project.team.filter(m => !team.includes(m.toString()));
      if (removedMembers.length > 0) {
        await TeamMember.updateMany(
          { _id: { $in: removedMembers } },
          { $pull: { projects: project._id } }
        );
      }
      // Add project to newly assigned members
      await TeamMember.updateMany(
        { _id: { $in: team } },
        { $addToSet: { projects: project._id } }
      );
      project.team = team;
    }

    const updatedProject = await project.save();
    const populated = await Project.findById(updatedProject._id).populate('team', 'name email role');

    emitSocketEvent('PROJECT_UPDATED', populated);
    emitSocketEvent('DASHBOARD_UPDATED', { type: 'PROJECT_UPDATED', id: project._id });
    invalidateCache();

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Cascade delete associated tasks
    await Task.deleteMany({ project: project._id });

    // Remove project reference from team members
    await TeamMember.updateMany(
      { projects: project._id },
      { $pull: { projects: project._id } }
    );

    await Project.findByIdAndDelete(project._id);

    emitSocketEvent('PROJECT_DELETED', { id: project._id });
    emitSocketEvent('DASHBOARD_UPDATED', { type: 'PROJECT_DELETED', id: project._id });
    invalidateCache();

    res.json({ success: true, message: 'Project and associated tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Digital Twin virtual model for project
export const getProjectDigitalTwin = async (req, res) => {
  try {
    const twin = await buildProjectDigitalTwin(req.params.id);
    res.json({ success: true, data: twin });
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

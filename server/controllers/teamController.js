import TeamMember from '../models/TeamMember.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { emitSocketEvent } from '../socket.js';

// Get all team members
export const getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find().populate('projects', 'name status progress').sort({ name: 1 });
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single member by ID
export const getTeamMemberById = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id).populate('projects', 'name status progress');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new team member
export const createTeamMember = async (req, res) => {
  try {
    const { name, email, role, projects } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
    }

    const existing = await TeamMember.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A team member with this email already exists' });
    }

    const member = new TeamMember({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role.trim(),
      projects: projects || []
    });

    const saved = await member.save();

    // If assigned to projects, update the projects' team arrays
    if (projects && projects.length > 0) {
      await Project.updateMany(
        { _id: { $in: projects } },
        { $addToSet: { team: saved._id } }
      );
    }

    const populated = await TeamMember.findById(saved._id).populate('projects', 'name status progress');

    emitSocketEvent('TEAM_MEMBER_CREATED', populated);
    emitSocketEvent('DASHBOARD_UPDATED', { type: 'TEAM_MEMBER_CREATED', id: saved._id });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update team member
export const updateTeamMember = async (req, res) => {
  try {
    const { name, email, role, projects } = req.body;
    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    if (email && email.toLowerCase().trim() !== member.email) {
      const existing = await TeamMember.findOne({ email: email.toLowerCase().trim(), _id: { $ne: member._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another member' });
      }
      member.email = email.toLowerCase().trim();
    }

    if (name) member.name = name.trim();
    if (role) member.role = role.trim();

    if (projects !== undefined) {
      // Sync with Project documents
      const removedProjects = member.projects.filter(p => !projects.includes(p.toString()));
      if (removedProjects.length > 0) {
        await Project.updateMany(
          { _id: { $in: removedProjects } },
          { $pull: { team: member._id } }
        );
      }
      await Project.updateMany(
        { _id: { $in: projects } },
        { $addToSet: { team: member._id } }
      );
      member.projects = projects;
    }

    const saved = await member.save();
    const populated = await TeamMember.findById(saved._id).populate('projects', 'name status progress');

    emitSocketEvent('TEAM_MEMBER_UPDATED', populated);
    emitSocketEvent('DASHBOARD_UPDATED', { type: 'TEAM_MEMBER_UPDATED', id: member._id });

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete team member
export const deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    // Remove from projects
    await Project.updateMany(
      { team: member._id },
      { $pull: { team: member._id } }
    );

    // Unassign from tasks
    await Task.updateMany(
      { assignedTo: member._id },
      { $set: { assignedTo: null } }
    );

    await TeamMember.findByIdAndDelete(member._id);

    emitSocketEvent('TEAM_MEMBER_DELETED', { id: member._id });
    emitSocketEvent('DASHBOARD_UPDATED', { type: 'TEAM_MEMBER_DELETED', id: member._id });

    res.json({ success: true, message: 'Team member deleted and unassigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

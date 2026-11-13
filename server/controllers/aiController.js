import {
  analyzeWorkspace,
  predictProjectDelay,
  detectProjectRisks,
  prioritizeTasks,
  analyzeTeamWorkload,
  generateWorkspaceBriefing,
  generateRecommendations,
  runWhatIfSimulation,
  answerQuestion,
  invalidateCache
} from '../services/aiEngine.js';

import AIRecommendation from '../models/AIRecommendation.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TeamMember from '../models/TeamMember.js';
import { emitSocketEvent } from '../socket.js';

// ─── Helper: get full workspace data ─────────────────────────────────────────
async function getWorkspaceData() {
  const [projects, tasks, members] = await Promise.all([
    Project.find().populate('team', 'name email role'),
    Task.find()
      .populate('project', 'name status deadline startDate progress')
      .populate('assignedTo', 'name email role'),
    TeamMember.find()
  ]);
  return { projects, tasks, members };
}

// ─── GET /api/ai/analyze ──────────────────────────────────────────────────────
export const getFullAnalysis = async (req, res) => {
  try {
    const result = await analyzeWorkspace();
    emitSocketEvent('ai:analysis:complete', {
      workspaceHealth: result.workspaceHealth,
      generatedAt: result.generatedAt
    });
    res.json({ success: true, data: result });
  } catch (err) {
    console.log('[AI Engine] getFullAnalysis error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/ai/analyze/trigger ─────────────────────────────────────────────
export const triggerAnalysis = async (req, res) => {
  try {
    invalidateCache();
    const result = await analyzeWorkspace();
    emitSocketEvent('ai:analysis:complete', {
      workspaceHealth: result.workspaceHealth,
      generatedAt: result.generatedAt
    });
    res.json({ success: true, message: 'Analysis re-triggered successfully', data: result });
  } catch (err) {
    console.log('[AI Engine] triggerAnalysis error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/ai/predictions ──────────────────────────────────────────────────
export const getPredictions = async (req, res) => {
  try {
    const { projects, tasks } = await getWorkspaceData();

    const predictions = projects.map(project => {
      const projectTasks = tasks.filter(t =>
        (t.project._id || t.project).toString() === project._id.toString()
      );
      return predictProjectDelay({
        projectId: project._id,
        projectName: project.name,
        tasks: projectTasks,
        startDate: project.startDate,
        deadline: project.deadline,
        progress: project.progress,
        status: project.status
      });
    });

    res.json({ success: true, data: predictions });
  } catch (err) {
    console.log('[AI Engine] getPredictions error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/ai/risks ────────────────────────────────────────────────────────
export const getRisks = async (req, res) => {
  try {
    const { projects, tasks, members } = await getWorkspaceData();
    const risks = detectProjectRisks(projects, tasks, members);
    res.json({ success: true, data: risks });
  } catch (err) {
    console.log('[AI Engine] getRisks error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/ai/tasks/priority ───────────────────────────────────────────────
export const getPrioritizedTasks = async (req, res) => {
  try {
    const { projects, tasks, members } = await getWorkspaceData();
    const prioritized = prioritizeTasks(tasks, projects, members);
    res.json({ success: true, data: prioritized });
  } catch (err) {
    console.log('[AI Engine] getPrioritizedTasks error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/ai/workload ─────────────────────────────────────────────────────
export const getWorkloadAnalysis = async (req, res) => {
  try {
    const { tasks, members } = await getWorkspaceData();
    const workload = analyzeTeamWorkload(members, tasks);
    res.json({ success: true, data: workload });
  } catch (err) {
    console.log('[AI Engine] getWorkloadAnalysis error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/ai/briefing ─────────────────────────────────────────────────────
export const getBriefing = async (req, res) => {
  try {
    const result = await analyzeWorkspace();
    const briefing = generateWorkspaceBriefing(result);
    res.json({ success: true, data: { briefing, generatedAt: result.generatedAt } });
  } catch (err) {
    console.log('[AI Engine] getBriefing error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/ai/recommendations ──────────────────────────────────────────────
export const getRecommendations = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const saved = await AIRecommendation.find(filter).sort({ generatedAt: -1 });

    // Also generate live recommendations if none saved
    let liveRecs = [];
    if (saved.length === 0 || req.query.live === 'true') {
      const result = await analyzeWorkspace();
      liveRecs = result.recommendations;
    }

    res.json({ success: true, data: saved.length > 0 ? saved : liveRecs });
  } catch (err) {
    console.log('[AI Engine] getRecommendations error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/ai/recommendations/:id/accept ──────────────────────────────────
export const acceptRecommendation = async (req, res) => {
  try {
    const rec = await AIRecommendation.findById(req.params.id);
    if (!rec) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }
    rec.status = 'Accepted';
    rec.respondedAt = new Date();
    rec.respondedBy = req.user ? req.user.name || req.user.email : 'Unknown';
    await rec.save();
    res.json({ success: true, data: rec });
  } catch (err) {
    console.log('[AI Engine] acceptRecommendation error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/ai/recommendations/:id/dismiss ─────────────────────────────────
export const dismissRecommendation = async (req, res) => {
  try {
    const rec = await AIRecommendation.findById(req.params.id);
    if (!rec) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }
    rec.status = 'Dismissed';
    rec.respondedAt = new Date();
    rec.respondedBy = req.user ? req.user.name || req.user.email : 'Unknown';
    if (req.body.auditNote) rec.auditNote = req.body.auditNote;
    await rec.save();
    res.json({ success: true, data: rec });
  } catch (err) {
    console.log('[AI Engine] dismissRecommendation error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/ai/simulate ───────────────────────────────────────────────────
export const runSimulation = async (req, res) => {
  try {
    const { type, projectId, value } = req.body;
    if (!type || !projectId) {
      return res.status(400).json({ success: false, message: 'type and projectId are required' });
    }
    const result = await runWhatIfSimulation({ type, projectId, value });
    res.json({ success: true, data: result });
  } catch (err) {
    console.log('[AI Engine] runSimulation error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/ai/ask (admin) ─────────────────────────────────────────────────
export const askAdminQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'question is required' });
    }

    // Build workspace data for context
    const result = await analyzeWorkspace();
    const workspaceData = {
      projects: result.projects,
      teamWorkload: result.teamWorkload,
      risks: result.risks,
      recommendations: result.recommendations,
      prioritizedTasks: result.prioritizedTasks
    };

    const response = answerQuestion(question, workspaceData);
    res.json({ success: true, data: response });
  } catch (err) {
    console.log('[AI Engine] askAdminQuestion error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/ai/employee/ask (employee) ─────────────────────────────────────
export const askEmployeeQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'question is required' });
    }

    const teamMemberId = req.user.teamMemberId;
    if (!teamMemberId) {
      return res.status(400).json({
        success: false,
        message: 'Your account is not linked to a team member profile.'
      });
    }

    // Only expose this employee's tasks
    const myTasks = await Task.find({ assignedTo: teamMemberId })
      .populate('project', 'name status deadline startDate progress')
      .populate('assignedTo', 'name email role');

    const projects = [...new Set(myTasks.map(t => t.project))].filter(Boolean);
    const prioritizedTasks = prioritizeTasks(myTasks, projects, []);

    const workspaceData = {
      projects,
      teamWorkload: [],
      risks: [],
      recommendations: [],
      prioritizedTasks
    };

    const response = answerQuestion(question, workspaceData);
    res.json({ success: true, data: response });
  } catch (err) {
    console.log('[AI Engine] askEmployeeQuestion error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/ai/history ─────────────────────────────────────────────────────
export const getRecommendationHistory = async (req, res) => {
  try {
    const history = await AIRecommendation.find({
      status: { $in: ['Accepted', 'Dismissed', 'Applied', 'Expired'] }
    }).sort({ respondedAt: -1 }).limit(50);

    res.json({ success: true, data: history });
  } catch (err) {
    console.log('[AI Engine] getRecommendationHistory error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

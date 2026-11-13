import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TeamMember from '../models/TeamMember.js';

/**
 * DIGITAL TWIN SERVICE (Virtual Model Engine)
 *
 * Core Concept:
 * Real Project Data (tasks, members, status, timelines, notes)
 *    ──► Digital Twin Engine (Services/digitalTwin.js)
 *    ──► Real-Time Virtual State (GET /api/projects/:id/twin)
 *    ──► Real-Time Monitoring & Visual Dashboards
 *
 * Designed as a clean decoupled service so Phase 2 AI/ML models
 * (Monte Carlo simulation, completion risk classifiers, NLP sentiment on issue notes)
 * can plug directly into the twin payload.
 */

/**
 * Auto-recalculate and persist project progress percentage based on completed tasks
 */
export const recalculateProjectProgress = async (projectId) => {
  const tasks = await Task.find({ project: projectId });
  if (!tasks || tasks.length === 0) {
    return 0;
  }
  const completedCount = tasks.filter(t => t.status === 'Done').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  await Project.findByIdAndUpdate(projectId, { progress: progressPercent });
  return progressPercent;
};

/**
 * Builds the complete Digital Twin object for a project
 */
export const buildProjectDigitalTwin = async (projectId) => {
  const project = await Project.findById(projectId).populate('team', 'name email role');
  if (!project) {
    throw new Error('Project not found');
  }

  const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email role');

  const now = new Date();
  const startDate = new Date(project.startDate);
  const deadline = new Date(project.deadline);

  // Task Counts
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const todoTasks = tasks.filter(t => t.status === 'To Do');

  const completedCount = completedTasks.length;
  const inProgressCount = inProgressTasks.length;
  const todoCount = todoTasks.length;

  // Auto-calculated progress %
  const calculatedProgress = totalTasks > 0
    ? Math.round((completedCount / totalTasks) * 100)
    : (project.progress || 0);

  // Sync back to project record if out of sync
  if (project.progress !== calculatedProgress && totalTasks > 0) {
    project.progress = calculatedProgress;
    await Project.findByIdAndUpdate(projectId, { progress: calculatedProgress });
  }

  // Overdue Tasks (deadline in the past and status is not Done)
  const overdueTasks = tasks.filter(t => {
    return t.status !== 'Done' && new Date(t.deadline) < now;
  });
  const overdueCount = overdueTasks.length;

  // Timeline & Schedule Metrics
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / msPerDay);
  const totalScheduledDays = Math.max(1, Math.ceil((deadline.getTime() - startDate.getTime()) / msPerDay));
  const daysElapsed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / msPerDay));

  // Expected progress based strictly on time elapsed
  let expectedProgress = Math.min(100, Math.max(0, Math.round((daysElapsed / totalScheduledDays) * 100)));
  if (daysRemaining < 0) {
    expectedProgress = 100;
  }
  const scheduleVariance = calculatedProgress - expectedProgress;

  // Workload per team member
  const memberWorkloadMap = {};
  const teamMembers = project.team || [];

  // Initialize for all assigned team members
  teamMembers.forEach(member => {
    memberWorkloadMap[member._id.toString()] = {
      memberId: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      totalAssigned: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      overdue: 0
    };
  });

  // Calculate task counts per member
  tasks.forEach(task => {
    if (task.assignedTo && task.assignedTo._id) {
      const id = task.assignedTo._id.toString();
      if (!memberWorkloadMap[id]) {
        memberWorkloadMap[id] = {
          memberId: task.assignedTo._id,
          name: task.assignedTo.name,
          email: task.assignedTo.email,
          role: task.assignedTo.role,
          totalAssigned: 0,
          completed: 0,
          inProgress: 0,
          todo: 0,
          overdue: 0
        };
      }
      const memberEntry = memberWorkloadMap[id];
      memberEntry.totalAssigned += 1;
      if (task.status === 'Done') memberEntry.completed += 1;
      else if (task.status === 'In Progress') memberEntry.inProgress += 1;
      else if (task.status === 'To Do') memberEntry.todo += 1;

      if (task.status !== 'Done' && new Date(task.deadline) < now) {
        memberEntry.overdue += 1;
      }
    }
  });

  const workloadPerMember = Object.values(memberWorkloadMap);

  // Issues and Problem Notes
  const issuesList = tasks
    .filter(t => t.issueNotes && t.issueNotes.trim().length > 0)
    .map(t => ({
      taskId: t._id,
      taskTitle: t.title,
      taskStatus: t.status,
      taskPriority: t.priority,
      assignedTo: t.assignedTo ? t.assignedTo.name : 'Unassigned',
      issueNotes: t.issueNotes
    }));

  const issueCount = issuesList.length;

  // Rule-based Health Status Calculation (Plain if/else logic, strictly NO AI/ML)
  let healthStatus = 'On Track';
  const healthFactors = [];

  const remainingTasksCount = totalTasks - completedCount;

  if (project.status === 'Completed' || (totalTasks > 0 && completedCount === totalTasks)) {
    healthStatus = 'On Track';
    healthFactors.push('Project is fully completed.');
  } else if (daysRemaining < 0) {
    healthStatus = 'Delayed';
    healthFactors.push(`Project deadline expired ${Math.abs(daysRemaining)} days ago with ${remainingTasksCount} unfinished tasks.`);
  } else if (remainingTasksCount > 0 && (overdueCount / remainingTasksCount) >= 0.35) {
    healthStatus = 'Delayed';
    healthFactors.push(`Critical overdue backlog: ${overdueCount} out of ${remainingTasksCount} active tasks are past deadline.`);
  } else if (daysRemaining <= 7 && calculatedProgress < 70) {
    healthStatus = 'At Risk';
    healthFactors.push(`Tight deadline: Only ${daysRemaining} days remaining with progress at ${calculatedProgress}%.`);
  } else if (scheduleVariance < -20) {
    healthStatus = 'At Risk';
    healthFactors.push(`Schedule slippage: Actual progress (${calculatedProgress}%) lags expected elapsed timeline (${expectedProgress}%).`);
  } else if (overdueTasks.some(t => t.priority === 'Urgent' || t.priority === 'High')) {
    healthStatus = 'At Risk';
    const urgentCount = overdueTasks.filter(t => t.priority === 'Urgent' || t.priority === 'High').length;
    healthFactors.push(`${urgentCount} high/urgent priority task(s) currently overdue.`);
  } else if (issueCount >= 3) {
    healthStatus = 'At Risk';
    healthFactors.push(`${issueCount} active blocker issue notes recorded across tasks.`);
  } else {
    healthStatus = 'On Track';
    healthFactors.push('Task execution velocity matches project timeline milestones.');
    if (overdueCount === 0) {
      healthFactors.push('Zero overdue tasks across all work streams.');
    }
  }

  // Assemble the Digital Twin virtual entity
  return {
    digitalTwinVersion: '1.0.0-core',
    generatedAt: now.toISOString(),
    project: {
      id: project._id,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      deadline: project.deadline,
      progress: calculatedProgress,
      team: teamMembers
    },
    computedMetrics: {
      progressPercent: calculatedProgress,
      totalTasks,
      completedCount,
      inProgressCount,
      todoCount,
      overdueCount,
      issueCount,
      daysRemaining,
      daysElapsed,
      totalScheduledDays,
      expectedProgress,
      scheduleVariance
    },
    health: {
      status: healthStatus, // 'On Track' | 'At Risk' | 'Delayed'
      factors: healthFactors,
      calculatedAt: now.toISOString()
    },
    workloadPerMember,
    overdueTasks: overdueTasks.map(t => ({
      id: t._id,
      title: t.title,
      deadline: t.deadline,
      priority: t.priority,
      status: t.status,
      assignedTo: t.assignedTo ? t.assignedTo.name : 'Unassigned'
    })),
    issues: issuesList,
    // Phase 2 extension points placeholder
    phase2ExtensionPoints: {
      aiPredictionModel: 'DISABLED (Phase 2 Target)',
      riskSimulationEngine: 'DISABLED (Phase 2 Target)',
      automatedRecommendations: 'DISABLED (Phase 2 Target)'
    }
  };
};

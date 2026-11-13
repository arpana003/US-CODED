/**
 * AI INTELLIGENCE ENGINE — US-CODED
 * Pure Node.js deterministic + statistical AI engine.
 * No external AI API calls. No Python service required.
 */

import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TeamMember from '../models/TeamMember.js';

// ─── In-Memory Cache ────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function setCache(key, value) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function invalidateCache() {
  cache.clear();
  console.log('[AI Engine] Cache invalidated.');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function daysFromNow(date) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / MS_PER_DAY);
}

function isOverdue(task) {
  return !['Done', 'Completed'].includes(task.status) && new Date(task.deadline) < new Date();
}

function uid() {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── predictProjectDelay ─────────────────────────────────────────────────────
export function predictProjectDelay(projectData) {
  const {
    projectId,
    projectName,
    tasks = [],
    startDate,
    deadline,
    progress,
    status
  } = projectData;

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const startDateDate = new Date(startDate || deadlineDate);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => ['Done', 'Completed'].includes(t.status)).length;
  const overdueTasks = tasks.filter(isOverdue);
  const urgentPending = tasks.filter(t =>
    !['Done', 'Completed'].includes(t.status) && ['High', 'Urgent'].includes(t.priority)
  );

  const totalScheduledDays = Math.max(1,
    Math.ceil((deadlineDate.getTime() - startDateDate.getTime()) / MS_PER_DAY)
  );
  const daysElapsed = Math.max(0, Math.ceil((now.getTime() - startDateDate.getTime()) / MS_PER_DAY));
  const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / MS_PER_DAY);

  const expectedProgress = clamp(Math.round((daysElapsed / totalScheduledDays) * 100), 0, 100);
  const actualProgress = typeof progress === 'number' ? progress :
    (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

  const overdueRatio = totalTasks > 0 ? overdueTasks.length / totalTasks : 0;
  const progressGap = Math.max(0, expectedProgress - actualProgress);
  const progressGapNormalized = clamp(progressGap / 100, 0, 1);
  const daysRemainingRatio = daysRemaining / Math.max(1, totalScheduledDays);
  const deadlinePressure = clamp(1 - daysRemainingRatio, 0, 1);
  const urgentPendingNormalized = clamp(urgentPending.length / Math.max(1, totalTasks), 0, 1);

  const delayRiskRaw =
    (overdueRatio * 35) +
    (progressGapNormalized * 30) +
    (urgentPendingNormalized * 20) +
    (deadlinePressure * 15);

  const delayRisk = clamp(Math.round(delayRiskRaw), 0, 100);

  let riskLevel = 'Low';
  if (delayRisk >= 75) riskLevel = 'Critical';
  else if (delayRisk >= 50) riskLevel = 'High';
  else if (delayRisk >= 25) riskLevel = 'Medium';

  // Estimate predicted delay days
  const incompleteTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? completedTasks / daysElapsed || 0.1 : 0.1;
  const daysNeededToComplete = incompleteTasks / Math.max(0.01, completionRate);
  const predictedDelayDays = daysRemaining < 0
    ? Math.abs(daysRemaining)
    : Math.max(0, Math.round(daysNeededToComplete - daysRemaining));

  const predictedCompletionDate = new Date(deadlineDate.getTime() + predictedDelayDays * MS_PER_DAY);

  // Confidence based on data richness
  let confidence = 'Preliminary';
  if (totalTasks >= 10 && daysElapsed >= 7) confidence = 'High';
  else if (totalTasks >= 3 && daysElapsed >= 2) confidence = 'Moderate';

  // Main factors
  const mainFactors = [];
  if (overdueRatio > 0.1) {
    mainFactors.push({
      factor: 'Overdue Tasks',
      impact: `${overdueTasks.length} task(s) overdue`,
      description: `${Math.round(overdueRatio * 100)}% of tasks are past their deadline`
    });
  }
  if (progressGap > 15) {
    mainFactors.push({
      factor: 'Schedule Variance',
      impact: `${progressGap}% behind expected pace`,
      description: `Expected ${expectedProgress}% completion, actual ${actualProgress}%`
    });
  }
  if (urgentPending.length > 0) {
    mainFactors.push({
      factor: 'Urgent/High Tasks Pending',
      impact: `${urgentPending.length} critical task(s) unresolved`,
      description: 'High-priority tasks not yet completed increase delivery risk'
    });
  }
  if (daysRemaining < 7 && daysRemaining > 0) {
    mainFactors.push({
      factor: 'Deadline Proximity',
      impact: `Only ${daysRemaining} day(s) remaining`,
      description: 'Tight deadline window reduces recovery margin'
    });
  }
  if (daysRemaining < 0) {
    mainFactors.push({
      factor: 'Past Deadline',
      impact: `${Math.abs(daysRemaining)} day(s) overdue`,
      description: 'Project deadline has already passed'
    });
  }

  let recommendation = 'Monitor project progress weekly and address overdue tasks promptly.';
  if (riskLevel === 'Critical') recommendation = 'Immediate escalation required. Reassign resources and re-scope deliverables.';
  else if (riskLevel === 'High') recommendation = 'Prioritize blocked/overdue tasks. Consider adding team capacity.';
  else if (riskLevel === 'Medium') recommendation = 'Review task distribution and ensure deadlines are met weekly.';

  return {
    projectId,
    projectName,
    delayRisk,
    riskLevel,
    predictedDelayDays,
    predictedCompletionDate,
    confidence,
    mainFactors,
    recommendation,
    modelNote: 'Deterministic rule-based model. No historical ML training data available. Results are preliminary indicators.'
  };
}

// ─── detectProjectRisks ───────────────────────────────────────────────────────
export function detectProjectRisks(projects, tasks, members) {
  const risks = [];
  const now = new Date();
  let riskCounter = 1;

  // Build member task map (active tasks)
  const memberActiveTasks = {};
  members.forEach(m => { memberActiveTasks[m._id.toString()] = 0; });
  tasks.forEach(t => {
    if (t.assignedTo && !['Done', 'Completed'].includes(t.status)) {
      const id = (t.assignedTo._id || t.assignedTo).toString();
      memberActiveTasks[id] = (memberActiveTasks[id] || 0) + 1;
    }
  });

  const memberCounts = Object.values(memberActiveTasks);
  const teamAvgActive = memberCounts.length > 0
    ? memberCounts.reduce((a, b) => a + b, 0) / memberCounts.length
    : 0;

  projects.forEach(project => {
    const projectTasks = tasks.filter(t =>
      (t.project._id || t.project).toString() === project._id.toString()
    );
    const overdueTasks = projectTasks.filter(isOverdue);
    const blockedTasks = projectTasks.filter(t => t.status === 'Blocked');

    const totalScheduledDays = Math.max(1,
      Math.ceil((new Date(project.deadline).getTime() - new Date(project.startDate || project.createdAt).getTime()) / MS_PER_DAY)
    );
    const daysElapsed = Math.max(0, Math.ceil((now.getTime() - new Date(project.startDate || project.createdAt).getTime()) / MS_PER_DAY));
    const daysRemaining = Math.ceil((new Date(project.deadline).getTime() - now.getTime()) / MS_PER_DAY);
    const expectedProgress = clamp(Math.round((daysElapsed / totalScheduledDays) * 100), 0, 100);
    const actualProgress = project.progress || 0;
    const progressGap = expectedProgress - actualProgress;

    // SCHEDULE_DELAY
    if (daysRemaining < 0 || progressGap > 25) {
      risks.push({
        riskId: `RISK_${riskCounter++}`,
        type: 'SCHEDULE_DELAY',
        severity: daysRemaining < 0 ? 'Critical' : progressGap > 40 ? 'High' : 'Medium',
        projectId: project._id,
        projectName: project.name,
        description: daysRemaining < 0
          ? `Project deadline passed ${Math.abs(daysRemaining)} days ago`
          : `Project is ${progressGap}% behind schedule`,
        evidence: `Expected progress: ${expectedProgress}%, Actual: ${actualProgress}%`,
        consequence: 'Delayed delivery, stakeholder dissatisfaction',
        recommendedAction: 'Reallocate resources and compress remaining timeline',
        detectedAt: now
      });
    }

    // OVERDUE_TASKS
    const hasUrgentOverdue = overdueTasks.some(t => ['Urgent', 'High'].includes(t.priority));
    if (overdueTasks.length > 3 || hasUrgentOverdue) {
      risks.push({
        riskId: `RISK_${riskCounter++}`,
        type: 'OVERDUE_TASKS',
        severity: hasUrgentOverdue ? 'High' : 'Medium',
        projectId: project._id,
        projectName: project.name,
        description: `${overdueTasks.length} overdue task(s) detected${hasUrgentOverdue ? ', including Urgent/High priority' : ''}`,
        evidence: overdueTasks.slice(0, 3).map(t => t.title).join(', '),
        consequence: 'Blocking downstream tasks and project completion',
        recommendedAction: 'Prioritize overdue tasks immediately or escalate to management',
        detectedAt: now
      });
    }

    // BLOCKED_TASKS
    if (blockedTasks.length > 0) {
      risks.push({
        riskId: `RISK_${riskCounter++}`,
        type: 'BLOCKED_TASKS',
        severity: blockedTasks.length >= 3 ? 'High' : 'Medium',
        projectId: project._id,
        projectName: project.name,
        description: `${blockedTasks.length} task(s) in Blocked status`,
        evidence: blockedTasks.slice(0, 3).map(t => t.title).join(', '),
        consequence: 'Cascading delays across dependent tasks',
        recommendedAction: 'Identify and resolve blockers in next standup',
        detectedAt: now
      });
    }

    // RESOURCE_GAP
    if ((project.team || []).length === 0 && projectTasks.length > 0) {
      risks.push({
        riskId: `RISK_${riskCounter++}`,
        type: 'RESOURCE_GAP',
        severity: 'High',
        projectId: project._id,
        projectName: project.name,
        description: 'Project has tasks but no team members assigned',
        evidence: `${projectTasks.length} task(s) with no assigned team`,
        consequence: 'Tasks will stall without responsible parties',
        recommendedAction: 'Assign at least one team member to this project immediately',
        detectedAt: now
      });
    }

    // STALE_PROJECT
    if (project.status === 'Active' && daysRemaining < 14 && daysRemaining >= 0 && actualProgress < expectedProgress - 10) {
      risks.push({
        riskId: `RISK_${riskCounter++}`,
        type: 'STALE_PROJECT',
        severity: 'Medium',
        projectId: project._id,
        projectName: project.name,
        description: `Active project nearing deadline with stalled progress (${actualProgress}% vs expected ${expectedProgress}%)`,
        evidence: `${daysRemaining} days remaining, progress gap: ${expectedProgress - actualProgress}%`,
        consequence: 'Project likely to miss deadline without immediate action',
        recommendedAction: 'Conduct urgent review meeting and compress task timelines',
        detectedAt: now
      });
    }
  });

  // OVERLOADED_MEMBER (cross-project)
  members.forEach(member => {
    const id = member._id.toString();
    const activeTasks = memberActiveTasks[id] || 0;
    if (teamAvgActive > 0 && activeTasks > teamAvgActive * 2) {
      risks.push({
        riskId: `RISK_${riskCounter++}`,
        type: 'OVERLOADED_MEMBER',
        severity: activeTasks > teamAvgActive * 3 ? 'High' : 'Medium',
        projectId: null,
        projectName: null,
        description: `Team member "${member.name}" has ${activeTasks} active tasks (team avg: ${Math.round(teamAvgActive)})`,
        evidence: `${activeTasks} active tasks vs team average of ${teamAvgActive.toFixed(1)}`,
        consequence: 'Burnout risk, quality degradation, and task delays',
        recommendedAction: `Redistribute some tasks from ${member.name} to other team members`,
        detectedAt: now
      });
    }
  });

  return risks;
}

// ─── prioritizeTasks ─────────────────────────────────────────────────────────
export function prioritizeTasks(tasks, projects, members) {
  const now = new Date();
  const projectMap = {};
  projects.forEach(p => { projectMap[p._id.toString()] = p; });
  const memberMap = {};
  members.forEach(m => { memberMap[m._id.toString()] = m; });

  const activeTasks = tasks.filter(t => !['Done', 'Completed'].includes(t.status));

  const scored = activeTasks.map(task => {
    let urgencyScore = 0;

    // Priority points
    if (task.priority === 'Urgent') urgencyScore += 40;
    else if (task.priority === 'High') urgencyScore += 25;
    else if (task.priority === 'Medium') urgencyScore += 10;
    else urgencyScore += 5;

    // Overdue
    if (isOverdue(task)) urgencyScore += 35;

    // Due soon
    const daysLeft = daysFromNow(task.deadline);
    if (!isOverdue(task)) {
      if (daysLeft <= 2) urgencyScore += 25;
      else if (daysLeft <= 7) urgencyScore += 15;
    }

    // Status modifiers
    if (task.status === 'Blocked') urgencyScore += 20;
    else if (task.status === 'In Progress') urgencyScore += 5;

    urgencyScore = clamp(urgencyScore, 0, 100);

    let urgencyLevel = 'Low';
    if (urgencyScore >= 75) urgencyLevel = 'Critical';
    else if (urgencyScore >= 50) urgencyLevel = 'High';
    else if (urgencyScore >= 25) urgencyLevel = 'Medium';

    // Reason
    const reasons = [];
    if (isOverdue(task)) reasons.push('overdue');
    if (task.priority === 'Urgent') reasons.push('urgent priority');
    else if (task.priority === 'High') reasons.push('high priority');
    if (task.status === 'Blocked') reasons.push('currently blocked');
    if (!isOverdue(task) && daysLeft <= 2) reasons.push(`due in ${daysLeft} day(s)`);
    const reason = reasons.length > 0
      ? `Task is ${reasons.join(', ')}`
      : 'Standard priority task requiring attention';

    // Project info
    const projectId = (task.project._id || task.project).toString();
    const project = projectMap[projectId];

    // Assigned member
    let assignedTo = null;
    if (task.assignedTo) {
      const memberId = (task.assignedTo._id || task.assignedTo).toString();
      const m = memberMap[memberId] || task.assignedTo;
      assignedTo = { name: m.name || 'Unknown', role: m.role || '' };
    }

    let suggestedAction = 'Complete at next available opportunity';
    if (urgencyLevel === 'Critical') suggestedAction = 'Address immediately — escalate if blocked';
    else if (urgencyLevel === 'High') suggestedAction = 'Complete within 24-48 hours';
    else if (urgencyLevel === 'Medium') suggestedAction = 'Schedule within this sprint/week';

    return {
      taskId: task._id,
      taskTitle: task.title,
      projectId,
      projectName: project ? project.name : 'Unknown Project',
      urgencyScore,
      urgencyLevel,
      reason,
      suggestedAction,
      expectedImpact: urgencyLevel === 'Critical'
        ? 'High — directly impacts project delivery'
        : urgencyLevel === 'High'
          ? 'Moderate — prevents downstream blocking'
          : 'Low to Moderate',
      assignedTo
    };
  });

  return scored.sort((a, b) => b.urgencyScore - a.urgencyScore);
}

// ─── analyzeTeamWorkload ──────────────────────────────────────────────────────
export function analyzeTeamWorkload(members, tasks) {
  const now = new Date();

  const workloadData = members.map(member => {
    const id = member._id.toString();
    const memberTasks = tasks.filter(t => {
      const assignedId = t.assignedTo ? (t.assignedTo._id || t.assignedTo).toString() : null;
      return assignedId === id;
    });

    const activeTasks = memberTasks.filter(t => !['Done', 'Completed'].includes(t.status)).length;
    const overdueTasks = memberTasks.filter(isOverdue).length;
    const completedTasks = memberTasks.filter(t => ['Done', 'Completed'].includes(t.status)).length;

    return {
      memberId: member._id,
      memberName: member.name,
      role: member.role,
      activeTasks,
      overdueTasks,
      completedTasks,
      _rawActive: activeTasks
    };
  });

  // Calculate team average for relative scoring
  const totalActive = workloadData.reduce((s, m) => s + m._rawActive, 0);
  const teamAvg = members.length > 0 ? totalActive / members.length : 0;
  const maxActive = Math.max(...workloadData.map(m => m._rawActive), 1);

  return workloadData.map(m => {
    const workloadScore = clamp(Math.round((m._rawActive / Math.max(1, maxActive)) * 100), 0, 100);

    let status = 'Balanced';
    if (teamAvg === 0) {
      status = m._rawActive === 0 ? 'Underloaded' : 'Balanced';
    } else if (m._rawActive > teamAvg * 1.75) {
      status = m._rawActive > teamAvg * 2.5 ? 'Critical' : 'Overloaded';
    } else if (m._rawActive < teamAvg * 0.4) {
      status = 'Underloaded';
    }

    let recommendation = 'Workload is balanced. Maintain current pace.';
    if (status === 'Critical') recommendation = `Immediately redistribute tasks from ${m.memberName} — burnout risk.`;
    else if (status === 'Overloaded') recommendation = `Consider moving 1-2 tasks from ${m.memberName} to peers.`;
    else if (status === 'Underloaded') recommendation = `${m.memberName} has capacity. Assign additional tasks.`;

    const { _rawActive, ...rest } = m;
    return { ...rest, workloadScore, status, recommendation };
  });
}

// ─── generateWorkspaceBriefing ───────────────────────────────────────────────
export function generateWorkspaceBriefing(analysisResult) {
  const { projects = [], teamWorkload = [], recommendations = [], alerts = [], workspaceHealth } = analysisResult;

  const activeProjects = projects.filter(p => p.status !== 'Completed').length;
  const riskyProjects = projects.filter(p =>
    p.prediction && ['High', 'Critical'].includes(p.prediction.riskLevel)
  ).length;

  const overdueTasks = projects.reduce((total, p) =>
    total + (p.overdueTasks || 0), 0
  );

  const overloadedMembers = teamWorkload.filter(m =>
    ['Overloaded', 'Critical'].includes(m.status)
  ).length;

  const topRec = recommendations[0];
  const topRecText = topRec
    ? `Immediate attention: ${topRec.title}.`
    : 'No critical recommendations at this time.';

  const healthLabel = workspaceHealth >= 75 ? 'healthy' : workspaceHealth >= 50 ? 'moderate' : 'at risk';

  return (
    `Your workspace is in ${healthLabel} condition (health score: ${workspaceHealth}/100). ` +
    `You have ${activeProjects} active project(s). ` +
    (riskyProjects > 0 ? `${riskyProjects} project(s) are showing schedule risks. ` : '') +
    (overdueTasks > 0 ? `${overdueTasks} task(s) are overdue across all projects. ` : 'No overdue tasks detected. ') +
    (overloadedMembers > 0 ? `${overloadedMembers} team member(s) have above-average workload. ` : 'Team workload is balanced. ') +
    topRecText
  );
}

// ─── generateRecommendations ─────────────────────────────────────────────────
export function generateRecommendations(analysisResult) {
  const recs = [];
  const now = new Date();

  const { projects = [], teamWorkload = [], risks = [] } = analysisResult;

  // Delay risk recommendations
  projects.forEach(p => {
    const pred = p.prediction;
    if (!pred) return;
    if (['High', 'Critical'].includes(pred.riskLevel)) {
      recs.push({
        id: uid(),
        title: `Address Delay Risk: ${p.name}`,
        description: pred.recommendation,
        projectId: p._id ? p._id.toString() : null,
        priority: pred.riskLevel === 'Critical' ? 'Critical' : 'High',
        evidence: pred.mainFactors.map(f => f.description).join('; ') || `Delay risk score: ${pred.delayRisk}/100`,
        expectedBenefit: 'Reduce delivery delay risk and restore project health',
        suggestedAction: pred.recommendation,
        type: 'DELAY_RISK',
        status: 'New',
        generatedAt: now
      });
    }
  });

  // Workload recommendations
  teamWorkload.forEach(m => {
    if (['Overloaded', 'Critical'].includes(m.status)) {
      recs.push({
        id: uid(),
        title: `Rebalance Workload: ${m.memberName}`,
        description: m.recommendation,
        projectId: null,
        priority: m.status === 'Critical' ? 'Critical' : 'High',
        evidence: `${m.memberName} has ${m.activeTasks} active tasks (workload score: ${m.workloadScore}/100)`,
        expectedBenefit: 'Prevent burnout and improve delivery quality',
        suggestedAction: m.recommendation,
        type: 'WORKLOAD',
        status: 'New',
        generatedAt: now
      });
    }
  });

  // Risk-based recommendations
  risks.forEach(risk => {
    if (['High', 'Critical'].includes(risk.severity)) {
      recs.push({
        id: uid(),
        title: `Risk: ${risk.type.replace(/_/g, ' ')}${risk.projectName ? ` (${risk.projectName})` : ''}`,
        description: risk.description,
        projectId: risk.projectId ? risk.projectId.toString() : null,
        priority: risk.severity,
        evidence: risk.evidence,
        expectedBenefit: `Mitigate: ${risk.consequence}`,
        suggestedAction: risk.recommendedAction,
        type: 'RISK',
        status: 'New',
        generatedAt: now
      });
    }
  });

  // General recommendations if none above
  if (recs.length === 0) {
    recs.push({
      id: uid(),
      title: 'Workspace is Healthy',
      description: 'No critical risks detected. Continue monitoring progress.',
      projectId: null,
      priority: 'Low',
      evidence: 'All projects within acceptable health parameters',
      expectedBenefit: 'Maintain current delivery velocity',
      suggestedAction: 'Conduct weekly progress reviews',
      type: 'GENERAL',
      status: 'New',
      generatedAt: now
    });
  }

  return recs;
}

// ─── runWhatIfSimulation ──────────────────────────────────────────────────────
export async function runWhatIfSimulation(params) {
  const { type, projectId, value } = params;
  const disclaimer = 'This is a simulation only. No actual project data has been modified.';

  try {
    // Fetch current project data
    const project = await Project.findById(projectId);
    if (!project) {
      return { error: 'Project not found', disclaimer };
    }
    const tasks = await Task.find({ project: projectId });
    const members = project.team || [];

    const now = new Date();
    const deadlineDate = new Date(project.deadline);
    const startDate = new Date(project.startDate || project.createdAt);

    const totalScheduledDays = Math.max(1,
      Math.ceil((deadlineDate.getTime() - startDate.getTime()) / MS_PER_DAY)
    );
    const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / MS_PER_DAY);

    const activeTasks = tasks.filter(t => !['Done', 'Completed'].includes(t.status));
    const teamSize = members.length || 1;

    const currentPrediction = predictProjectDelay({
      projectId: project._id,
      projectName: project.name,
      tasks,
      startDate: project.startDate,
      deadline: project.deadline,
      progress: project.progress,
      status: project.status
    });

    const current = {
      completionDate: currentPrediction.predictedCompletionDate,
      delayRisk: currentPrediction.delayRisk,
      healthStatus: currentPrediction.riskLevel,
      workloadAvg: activeTasks.length / teamSize
    };

    let simulated = { ...current };
    let deltaDelayDays = 0;
    let scenarioName = '';
    let description = '';
    let aiExplanation = '';
    let impact = 'Neutral';

    switch (type) {
      case 'ADD_MEMBERS': {
        const addCount = parseInt(value) || 1;
        const newTeamSize = teamSize + addCount;
        const newWorkloadAvg = activeTasks.length / Math.max(1, newTeamSize);
        const workloadReduction = 1 - (newWorkloadAvg / Math.max(1, current.workloadAvg));
        const delayReduction = Math.round(currentPrediction.predictedDelayDays * workloadReduction * 0.6);
        deltaDelayDays = -delayReduction;
        const newRisk = clamp(current.delayRisk - Math.round(workloadReduction * 25), 0, 100);

        simulated = {
          completionDate: new Date(deadlineDate.getTime() + Math.max(0, currentPrediction.predictedDelayDays - delayReduction) * MS_PER_DAY),
          delayRisk: newRisk,
          healthStatus: newRisk >= 75 ? 'Critical' : newRisk >= 50 ? 'High' : newRisk >= 25 ? 'Medium' : 'Low',
          workloadAvg: parseFloat(newWorkloadAvg.toFixed(2))
        };
        scenarioName = `Add ${addCount} Team Member(s)`;
        description = `Simulates the effect of adding ${addCount} new member(s) to the project team`;
        aiExplanation = `Adding ${addCount} member(s) reduces per-person workload by ~${Math.round(workloadReduction * 100)}%, potentially saving ~${delayReduction} days of delay.`;
        impact = delayReduction > 0 ? 'Positive' : 'Neutral';
        break;
      }

      case 'TASK_DELAY': {
        const delayDays = parseInt(value) || 1;
        const criticalTasks = tasks.filter(t => ['Urgent', 'High'].includes(t.priority) && !['Done', 'Completed'].includes(t.status));
        const impactMultiplier = criticalTasks.length > 0 ? 1.5 : 1;
        const extraDelay = Math.round(delayDays * impactMultiplier);
        deltaDelayDays = extraDelay;
        const newRisk = clamp(current.delayRisk + Math.round(extraDelay * 1.2), 0, 100);

        simulated = {
          completionDate: new Date((currentPrediction.predictedCompletionDate || deadlineDate).getTime() + extraDelay * MS_PER_DAY),
          delayRisk: newRisk,
          healthStatus: newRisk >= 75 ? 'Critical' : newRisk >= 50 ? 'High' : newRisk >= 25 ? 'Medium' : 'Low',
          workloadAvg: current.workloadAvg
        };
        scenarioName = `Critical Task Delayed by ${delayDays} Day(s)`;
        description = `Simulates delaying a critical task by ${delayDays} days`;
        aiExplanation = `Delaying a critical task by ${delayDays} day(s) cascades to an estimated ${extraDelay} days of total project delay (${criticalTasks.length} critical tasks currently active).`;
        impact = 'Negative';
        break;
      }

      case 'MEMBER_UNAVAILABLE': {
        const newTeamSize = Math.max(1, teamSize - 1);
        const newWorkloadAvg = activeTasks.length / newTeamSize;
        const workloadIncrease = newWorkloadAvg - current.workloadAvg;
        const addedDelay = Math.round(workloadIncrease * 2);
        deltaDelayDays = addedDelay;
        const newRisk = clamp(current.delayRisk + Math.round(addedDelay * 1.5), 0, 100);

        simulated = {
          completionDate: new Date((currentPrediction.predictedCompletionDate || deadlineDate).getTime() + addedDelay * MS_PER_DAY),
          delayRisk: newRisk,
          healthStatus: newRisk >= 75 ? 'Critical' : newRisk >= 50 ? 'High' : newRisk >= 25 ? 'Medium' : 'Low',
          workloadAvg: parseFloat(newWorkloadAvg.toFixed(2))
        };
        scenarioName = 'Member Unavailable';
        description = 'Simulates removing one team member (sick leave, departure, etc.)';
        aiExplanation = `Losing a team member increases per-person workload from ${current.workloadAvg.toFixed(1)} to ${newWorkloadAvg.toFixed(1)} tasks, adding ~${addedDelay} days of delay.`;
        impact = 'Negative';
        break;
      }

      case 'SPEED_INCREASE': {
        const pctIncrease = parseFloat(value) || 10;
        const speedFactor = 1 + (pctIncrease / 100);
        const savedDays = Math.round(daysRemaining * (1 - 1 / speedFactor));
        deltaDelayDays = -savedDays;
        const newRisk = clamp(current.delayRisk - Math.round(pctIncrease * 0.4), 0, 100);

        simulated = {
          completionDate: new Date(deadlineDate.getTime() - Math.min(savedDays, currentPrediction.predictedDelayDays) * MS_PER_DAY),
          delayRisk: newRisk,
          healthStatus: newRisk >= 75 ? 'Critical' : newRisk >= 50 ? 'High' : newRisk >= 25 ? 'Medium' : 'Low',
          workloadAvg: current.workloadAvg
        };
        scenarioName = `${pctIncrease}% Speed Increase`;
        description = `Simulates increasing task completion rate by ${pctIncrease}%`;
        aiExplanation = `A ${pctIncrease}% speed increase could save approximately ${savedDays} days, potentially recovering the schedule.`;
        impact = savedDays > 0 ? 'Positive' : 'Neutral';
        break;
      }

      case 'DEADLINE_EXTENSION': {
        const extendDays = parseInt(value) || 7;
        const newDeadline = new Date(deadlineDate.getTime() + extendDays * MS_PER_DAY);
        const newDaysRemaining = daysRemaining + extendDays;
        const newDelayRisk = clamp(current.delayRisk - Math.round(extendDays * 1.5), 0, 100);
        deltaDelayDays = 0;

        simulated = {
          completionDate: newDeadline,
          delayRisk: newDelayRisk,
          healthStatus: newDelayRisk >= 75 ? 'Critical' : newDelayRisk >= 50 ? 'High' : newDelayRisk >= 25 ? 'Medium' : 'Low',
          workloadAvg: current.workloadAvg
        };
        scenarioName = `Deadline Extension by ${extendDays} Days`;
        description = `Simulates extending the project deadline by ${extendDays} days`;
        aiExplanation = `Extending the deadline by ${extendDays} days reduces pressure, lowering delay risk from ${current.delayRisk} to ${newDelayRisk}. New deadline: ${newDeadline.toDateString()}.`;
        impact = newDelayRisk < current.delayRisk ? 'Positive' : 'Neutral';
        break;
      }

      default:
        return {
          error: `Unknown simulation type: ${type}`,
          disclaimer
        };
    }

    return {
      scenarioName,
      description,
      current,
      simulated,
      deltaDelayDays,
      impact,
      aiExplanation,
      disclaimer
    };
  } catch (err) {
    console.log('[AI Engine] Simulation error:', err.message);
    return { error: err.message, disclaimer };
  }
}

// ─── answerQuestion ───────────────────────────────────────────────────────────
export function answerQuestion(question, workspaceData) {
  const q = (question || '').toLowerCase();
  const { projects = [], teamWorkload = [], risks = [], recommendations = [], prioritizedTasks = [] } = workspaceData;

  let answer = '';
  const relevantData = [];
  const suggestions = [];

  if (q.includes('delay') || q.includes('overdue') || q.includes('deadline')) {
    const riskyProjects = projects.filter(p => p.prediction && ['High', 'Critical'].includes(p.prediction.riskLevel));
    const overdueTasks = prioritizedTasks.filter(t => t.urgencyLevel === 'Critical');
    answer = riskyProjects.length > 0
      ? `${riskyProjects.length} project(s) are at high/critical delay risk: ${riskyProjects.map(p => p.name).join(', ')}.`
      : 'No projects are currently at high delay risk.';
    if (overdueTasks.length > 0) answer += ` ${overdueTasks.length} task(s) are critically overdue.`;
    relevantData.push(...riskyProjects.slice(0, 3));
    suggestions.push('Review delay predictions in the AI Predictions panel', 'Prioritize overdue tasks immediately');

  } else if (q.includes('risk')) {
    const criticalRisks = risks.filter(r => ['High', 'Critical'].includes(r.severity));
    answer = criticalRisks.length > 0
      ? `${criticalRisks.length} critical/high risk(s) detected: ${criticalRisks.slice(0, 3).map(r => r.type.replace(/_/g, ' ')).join(', ')}.`
      : 'No critical risks currently detected.';
    relevantData.push(...criticalRisks.slice(0, 3));
    suggestions.push('View detailed risk breakdown in the Risks panel');

  } else if (q.includes('overloaded') || q.includes('workload') || q.includes('team')) {
    const overloaded = teamWorkload.filter(m => ['Overloaded', 'Critical'].includes(m.status));
    answer = overloaded.length > 0
      ? `${overloaded.length} team member(s) are overloaded: ${overloaded.map(m => m.memberName).join(', ')}.`
      : 'Team workload appears balanced.';
    relevantData.push(...overloaded.slice(0, 3));
    suggestions.push('Use the Workload panel to redistribute tasks');

  } else if (q.includes('focus') || q.includes('today') || q.includes('priority') || q.includes('critical')) {
    const topTasks = prioritizedTasks.slice(0, 3);
    answer = topTasks.length > 0
      ? `Top priorities right now: ${topTasks.map(t => `"${t.taskTitle}" (${t.urgencyLevel})`).join('; ')}.`
      : 'No high-priority tasks requiring immediate attention.';
    relevantData.push(...topTasks);
    suggestions.push('See all prioritized tasks in the Task Priority panel');

  } else if (q.includes('block') || q.includes('blocking') || q.includes('stuck')) {
    const blockedRisks = risks.filter(r => r.type === 'BLOCKED_TASKS');
    const blockedTasks = prioritizedTasks.filter(t => t.reason && t.reason.includes('blocked'));
    answer = blockedRisks.length > 0
      ? `${blockedRisks.length} project(s) have blocked tasks. ${blockedTasks.length} task(s) are actively blocked.`
      : 'No blocked tasks detected currently.';
    relevantData.push(...blockedRisks.slice(0, 3));
    suggestions.push('Identify and resolve blockers in next standup');

  } else if (q.includes('project') || q.includes('performance')) {
    const healthSummary = projects.map(p => `${p.name}: ${p.prediction ? p.prediction.riskLevel + ' risk' : 'Unknown'}`);
    answer = `Workspace has ${projects.length} project(s). ${healthSummary.slice(0, 3).join(', ')}.`;
    relevantData.push(...projects.slice(0, 3));
    suggestions.push('View detailed project analytics in the AI Analysis panel');

  } else if (q.includes('recommend') || q.includes('help') || q.includes('suggest')) {
    const topRec = recommendations[0];
    answer = topRec
      ? `Top recommendation: ${topRec.title} — ${topRec.description}`
      : 'No recommendations at this time. Workspace appears healthy.';
    relevantData.push(...recommendations.slice(0, 3));
    suggestions.push('Review all recommendations in the Recommendations panel');

  } else {
    // Generic fallback using workspace summary
    answer = `Your workspace has ${projects.length} project(s), ${teamWorkload.length} team member(s), and ${risks.length} detected risk(s). Ask me about delays, risks, workload, priorities, or specific projects.`;
    suggestions.push(
      'Ask: "Which projects are delayed?"',
      'Ask: "Who is overloaded?"',
      'Ask: "What should I focus on today?"'
    );
  }

  return { answer, relevantData, suggestions };
}

// ─── analyzeWorkspace (main) ──────────────────────────────────────────────────
export async function analyzeWorkspace() {
  console.log('[AI Engine] Starting workspace analysis...');

  const cached = getCache('workspace_analysis');
  if (cached) {
    console.log('[AI Engine] Returning cached analysis.');
    return cached;
  }

  try {
    const [projects, tasks, members] = await Promise.all([
      Project.find().populate('team', 'name email role'),
      Task.find()
        .populate('project', 'name status deadline startDate progress')
        .populate('assignedTo', 'name email role'),
      TeamMember.find()
    ]);

    console.log(`[AI Engine] Loaded ${projects.length} projects, ${tasks.length} tasks, ${members.length} members.`);

    // Build per-project data for predictions
    const projectAnalysis = projects.map(project => {
      const projectTasks = tasks.filter(t =>
        (t.project._id || t.project).toString() === project._id.toString()
      );
      const overdueTasks = projectTasks.filter(isOverdue).length;
      const prediction = predictProjectDelay({
        projectId: project._id,
        projectName: project.name,
        tasks: projectTasks,
        startDate: project.startDate,
        deadline: project.deadline,
        progress: project.progress,
        status: project.status
      });
      return {
        _id: project._id,
        name: project.name,
        status: project.status,
        progress: project.progress,
        deadline: project.deadline,
        team: project.team,
        overdueTasks,
        prediction
      };
    });

    // Risk detection
    const risks = detectProjectRisks(projects, tasks, members);

    // Task prioritization
    const prioritizedTasks = prioritizeTasks(tasks, projects, members);

    // Team workload
    const teamWorkload = analyzeTeamWorkload(members, tasks);

    // Workspace health score (0-100)
    const projectCount = projects.length;
    const criticalRisks = risks.filter(r => r.severity === 'Critical').length;
    const highRisks = risks.filter(r => r.severity === 'High').length;
    const overloadedMembers = teamWorkload.filter(m => ['Overloaded', 'Critical'].includes(m.status)).length;
    const totalOverdue = tasks.filter(isOverdue).length;
    const avgDelayRisk = projectCount > 0
      ? projectAnalysis.reduce((s, p) => s + (p.prediction.delayRisk || 0), 0) / projectCount
      : 0;

    let healthScore = 100;
    healthScore -= criticalRisks * 15;
    healthScore -= highRisks * 8;
    healthScore -= overloadedMembers * 5;
    healthScore -= Math.min(20, totalOverdue * 2);
    healthScore -= Math.round(avgDelayRisk * 0.2);
    const workspaceHealth = clamp(Math.round(healthScore), 0, 100);

    // Alerts
    const alerts = [];
    risks.filter(r => r.severity === 'Critical').forEach(r => {
      alerts.push({
        type: 'CRITICAL',
        message: r.description,
        projectId: r.projectId,
        detectedAt: r.detectedAt
      });
    });

    const analysisResult = {
      workspaceHealth,
      projects: projectAnalysis,
      teamWorkload,
      risks,
      prioritizedTasks,
      recommendations: [],
      alerts,
      briefing: '',
      generatedAt: new Date()
    };

    // Generate recommendations and briefing
    analysisResult.recommendations = generateRecommendations(analysisResult);
    analysisResult.briefing = generateWorkspaceBriefing(analysisResult);

    setCache('workspace_analysis', analysisResult);
    console.log(`[AI Engine] Analysis complete. Health: ${workspaceHealth}/100`);
    return analysisResult;

  } catch (err) {
    console.log('[AI Engine] Analysis error:', err.message);
    throw err;
  }
}

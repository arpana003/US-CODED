import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TeamMember from '../models/TeamMember.js';
import { buildProjectDigitalTwin } from '../services/digitalTwin.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const [projects, tasks, members] = await Promise.all([
      Project.find().populate('team', 'name email role').sort({ createdAt: -1 }),
      Task.find().populate('project', 'name status').populate('assignedTo', 'name email role'),
      TeamMember.find().populate('projects', 'name')
    ]);

    const now = new Date();

    // 1. Overview counts
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const planningProjects = projects.filter(p => p.status === 'Planning').length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const todoTasks = tasks.filter(t => t.status === 'To Do').length;
    const activeTasks = totalTasks - completedTasks;

    const overdueTasks = tasks.filter(t => t.status !== 'Done' && new Date(t.deadline) < now);
    const overdueCount = overdueTasks.length;

    const issueTasks = tasks.filter(t => t.issueNotes && t.issueNotes.trim().length > 0);
    const issuesCount = issueTasks.length;

    // 2. Task Status Distribution (Pie / Donut)
    const taskStatusDistribution = [
      { name: 'To Do', value: todoTasks, color: '#f59e0b' },
      { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
      { name: 'Done', value: completedTasks, color: '#10b981' }
    ];

    // 3. Project Progress Bar Chart Data
    const projectProgress = projects.map(p => ({
      id: p._id,
      name: p.name.length > 22 ? p.name.substring(0, 20) + '...' : p.name,
      fullName: p.name,
      progress: p.progress,
      status: p.status,
      deadline: p.deadline
    }));

    // 4. Workload Per Member Bar Chart Data
    const memberWorkloadMap = {};
    members.forEach(m => {
      memberWorkloadMap[m._id.toString()] = {
        id: m._id,
        name: m.name,
        role: m.role,
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        overdue: 0
      };
    });

    tasks.forEach(t => {
      if (t.assignedTo && t.assignedTo._id) {
        const id = t.assignedTo._id.toString();
        if (memberWorkloadMap[id]) {
          memberWorkloadMap[id].total += 1;
          if (t.status === 'Done') memberWorkloadMap[id].completed += 1;
          else if (t.status === 'In Progress') memberWorkloadMap[id].inProgress += 1;
          else if (t.status === 'To Do') memberWorkloadMap[id].todo += 1;

          if (t.status !== 'Done' && new Date(t.deadline) < now) {
            memberWorkloadMap[id].overdue += 1;
          }
        }
      }
    });

    const memberWorkload = Object.values(memberWorkloadMap);

    // 5. Timeline vs Actual Progress Comparison (Line / Bar)
    const msPerDay = 1000 * 60 * 60 * 24;
    const timelineVsActual = projects.map(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.deadline);
      const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / msPerDay));
      const daysElapsed = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / msPerDay));
      const expectedProgress = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));
      const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / msPerDay);

      return {
        id: p._id,
        name: p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name,
        fullName: p.name,
        actualProgress: p.progress,
        expectedProgress: daysRemaining < 0 ? 100 : expectedProgress,
        daysRemaining,
        variance: p.progress - (daysRemaining < 0 ? 100 : expectedProgress)
      };
    });

    // 6. Project Health Diagnostics via Digital Twin
    const healthCounts = {
      onTrack: 0,
      atRisk: 0,
      delayed: 0
    };

    const projectTwinsSummary = [];
    for (const proj of projects) {
      try {
        const twin = await buildProjectDigitalTwin(proj._id);
        if (twin.health.status === 'On Track') healthCounts.onTrack += 1;
        else if (twin.health.status === 'At Risk') healthCounts.atRisk += 1;
        else if (twin.health.status === 'Delayed') healthCounts.delayed += 1;

        projectTwinsSummary.push({
          id: proj._id,
          name: proj.name,
          progress: twin.computedMetrics.progressPercent,
          healthStatus: twin.health.status,
          factors: twin.health.factors,
          overdueCount: twin.computedMetrics.overdueCount,
          daysRemaining: twin.computedMetrics.daysRemaining
        });
      } catch (err) {
        console.error(`Error calculating twin for ${proj._id}:`, err.message);
      }
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalProjects,
          activeProjects,
          completedProjects,
          planningProjects,
          totalTasks,
          activeTasks,
          completedTasks,
          overdueTasks: overdueCount,
          totalTeamMembers: members.length,
          issuesCount
        },
        healthCounts,
        taskStatusDistribution,
        projectProgress,
        memberWorkload,
        timelineVsActual,
        projectTwinsSummary,
        recentTasks: tasks.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  FolderKanban, CheckSquare, Users, AlertTriangle,
  TrendingUp, Clock, Zap, Activity, Plus, Sparkles,
  Calendar, CheckCircle2, ArrowRight, ShieldCheck, Flame, ChevronRight
} from 'lucide-react';
import { dashboardApi, projectsApi, teamApi, aiApi } from '../services/api';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useAuth } from '../context/AuthContext';
import { fmt } from '../utils/helpers';
import sound from '../utils/sound';
import Topbar from '../components/layout/Topbar';
import { Spinner, EmptyState } from '../components/common/LoadingStates';
import Avatar from '../components/common/Avatar';
import ProjectModal from '../components/projects/ProjectModal';
import TaskModal from '../components/tasks/TaskModal';
import TeamModal from '../components/team/TeamModal';
import IntelligenceModal from '../components/common/IntelligenceModal';

// ── Custom Glass Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#15161B',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '0.8125rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      }}
    >
      {label && <p style={{ color: '#A5A5B0', marginBottom: 6, fontWeight: 600 }}>{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: entry.color || '#F4F2EE' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, display: 'inline-block' }} />
          <span>{entry.name}: <strong style={{ color: '#F4F2EE' }}>{entry.value}</strong></span>
        </div>
      ))}
    </div>
  );
};

// ── Master KPI Card ────────────────────────────────────────────────
const KPICard = ({ label, value, icon: Icon, color, sublabel, trend }) => (
  <motion.div
    className="card"
    whileHover={{ y: -3, transition: { duration: 0.15 } }}
    style={{
      padding: '20px',
      background: '#161820',
      border: '1px solid rgba(255, 255, 255, 0.07)',
      borderRadius: '14px',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }}
    />

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: '0.785rem', fontWeight: 600, color: '#A5A5B0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '9px',
          background: `rgba(${color === '#78DCE8' ? '120, 220, 232' : color === '#9B8AFB' ? '155, 138, 251' : color === '#72C9A5' ? '114, 201, 165' : '231, 184, 108'}, 0.14)`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={18} />
      </div>
    </div>

    <div style={{ fontSize: '1.95rem', fontWeight: 800, color: '#F4F2EE', lineHeight: 1, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
      {value ?? '—'}
    </div>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6D6F7C' }}>
      <span>{sublabel}</span>
      {trend && (
        <span style={{ color: color, fontWeight: 600 }}>
          {trend}
        </span>
      )}
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [aiBriefing, setAiBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'project' | 'task' | 'team' | 'intel'
  const [projectsList, setProjectsList] = useState([]);
  const [teamList, setTeamList] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await dashboardApi.getSummary();
      const raw = res.data || res;
      const overview = raw.overview || {};

      const [pRes, tRes, bRes] = await Promise.allSettled([
        projectsApi.getAll(),
        teamApi.getAll(),
        aiApi.getBriefing(),
      ]);

      if (pRes.status === 'fulfilled' && pRes.value?.data) {
        setProjectsList(pRes.value.data);
      }
      if (tRes.status === 'fulfilled' && tRes.value?.data) {
        setTeamList(tRes.value.data);
      }
      if (bRes.status === 'fulfilled' && bRes.value?.data) {
        setAiBriefing(bRes.value.data);
      }

      const kpi = {
        totalProjects: overview.totalProjects || 0,
        activeProjects: (raw.projectTwinsSummary || []).filter(p => p.status === 'Active').length || overview.totalProjects || 0,
        totalMembers: overview.totalTeamMembers || 0,
        activeTasks: overview.activeTasks || 0,
        completedTasks: overview.completedTasks || 0,
        overdueCount: overview.overdueTasks || 0,
        totalTasks: overview.totalTasks || 0,
      };

      const STATUS_COLORS = {
        'To Do': '#6D6F7C',
        'In Progress': '#9B8AFB',
        'Under Review': '#E7B86C',
        'Completed': '#72C9A5',
        'Done': '#72C9A5',
        'Blocked': '#E47C82',
      };

      const taskStatusBreakdown = (raw.taskStatusDistribution || []).map((t) => ({
        ...t,
        color: STATUS_COLORS[t.name] || '#9B8AFB',
      }));

      const projectProgress = (raw.projectProgress || []).map((p) => ({
        ...p,
        color: p.status === 'Completed' ? '#72C9A5' : p.status === 'Active' ? '#9B8AFB' : '#E7B86C',
      }));

      const workloadChart = (raw.memberWorkload || []).map((m) => ({
        id: m.id,
        name: m.name,
        done: m.completed || 0,
        inProgress: m.inProgress || 0,
        todo: m.todo || 0,
        total: m.total || 0,
      }));

      const recentOverdue = (raw.recentTasks || [])
        .filter((t) => t.status !== 'Done' && t.status !== 'Completed' && new Date(t.deadline) < new Date())
        .map((t) => ({
          id: t._id,
          title: t.title,
          project: t.project?.name || 'Workspace Project',
          assignedTo: t.assignedTo?.name || 'Unassigned',
          deadline: t.deadline,
          priority: t.priority || 'Medium',
        }));

      const upcomingTasks = (raw.recentTasks || []).slice(0, 6);

      setData({
        kpi,
        charts: {
          taskStatusBreakdown,
          projectProgress,
          workloadChart,
        },
        recentOverdue,
        upcomingTasks,
        projectTwins: raw.projectTwinsSummary || [],
      });
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useSocketEvents(
    [
      'dashboard:update',
      'task:created',
      'task:updated',
      'task:deleted',
      'project:created',
      'project:updated',
      'project:deleted',
    ],
    fetchData
  );

  if (loading) {
    return (
      <div>
        <Topbar title="Overview" subtitle="Loading intelligence overview…" />
        <div style={{ marginTop: 80 }}>
          <Spinner text="Calibrating Digital Twin telemetry…" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Topbar title="Overview" subtitle="Real-time workspace overview" />
        <div className="page-container">
          <div className="card" style={{ marginTop: 40, textAlign: 'center', color: '#E47C82' }}>
            <AlertTriangle size={32} style={{ marginBottom: 12 }} />
            <p>{error}</p>
            <button
              className="btn btn-secondary"
              style={{ marginTop: 16 }}
              onClick={fetchData}
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { kpi, charts, recentOverdue, upcomingTasks, projectTwins } = data;

  return (
    <div>
      <Topbar title="Workspace Overview" subtitle="Real-time Digital Twin telemetry · Live connected" />

      <div className="page-container">
        {/* ── Welcome Header Section ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '26px',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F4F2EE', letterSpacing: '-0.02em', margin: 0 }}>
                Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#D8C7A3',
                  background: 'rgba(216, 199, 163, 0.12)',
                  border: '1px solid rgba(216, 199, 163, 0.3)',
                  padding: '3px 9px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Sparkles size={11} /> Lead Administrator
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#A5A5B0', marginTop: 4 }}>
              Here is the live operational status across your digital twin ecosystems today, {format(new Date(), 'EEEE, MMMM do')}.
            </p>
          </div>

          {/* Quick Actions (All Functional) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                sound.playClick();
                setActiveModal('team');
              }}
              style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
            >
              <Users size={15} />
              <span>Add Member</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                sound.playClick();
                setActiveModal('task');
              }}
              style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
            >
              <CheckSquare size={15} />
              <span>Create Task</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                sound.playClick();
                setActiveModal('project');
              }}
              style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
            >
              <Plus size={15} />
              <span>New Project</span>
            </button>
          </div>
        </motion.div>

        {/* ── AI Daily Workspace Briefing Banner ─────────────────── */}
        {aiBriefing?.briefing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(120, 220, 232, 0.08) 0%, rgba(155, 138, 251, 0.08) 100%)',
              border: '1px solid rgba(120, 220, 232, 0.25)',
              borderLeft: '4px solid #78DCE8',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'rgba(120, 220, 232, 0.18)',
                  color: '#78DCE8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#78DCE8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Good Morning! Here is your AI Workspace Briefing
                </div>
                <div style={{ fontSize: '0.875rem', color: '#F4F2EE', marginTop: 3, lineHeight: 1.4 }}>
                  {aiBriefing.briefing}
                </div>
              </div>
            </div>

            <Link
              to="/ai"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: '8px',
                background: 'rgba(120, 220, 232, 0.15)',
                border: '1px solid rgba(120, 220, 232, 0.3)',
                color: '#78DCE8',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>View Full Report</span>
              <ChevronRight size={14} />
            </Link>
          </motion.div>
        )}

        {/* ── 6 KPI Cards in Balanced Responsive Grid ───────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '16px',
            marginBottom: '26px',
          }}
          className="kpi-six-grid"
        >
          <KPICard
            label="Total Projects"
            value={kpi.totalProjects}
            icon={FolderKanban}
            color="#9B8AFB"
            sublabel="Under management"
            trend="Active"
          />
          <KPICard
            label="Active Projects"
            value={kpi.activeProjects}
            icon={Flame}
            color="#78DCE8"
            sublabel="In delivery flight"
            trend="100%"
          />
          <KPICard
            label="Team Members"
            value={kpi.totalMembers}
            icon={Users}
            color="#D8C7A3"
            sublabel="Allocated engineers"
            trend="Optimal"
          />
          <KPICard
            label="Active Tasks"
            value={kpi.activeTasks}
            icon={Activity}
            color="#7189C9"
            sublabel="In progress & todo"
            trend="Flowing"
          />
          <KPICard
            label="Completed Tasks"
            value={kpi.completedTasks}
            icon={CheckCircle2}
            color="#72C9A5"
            sublabel="Verified delivered"
            trend="Stable"
          />
          <KPICard
            label="Overdue / Risk"
            value={kpi.overdueCount}
            icon={AlertTriangle}
            color={kpi.overdueCount > 0 ? '#E47C82' : '#72C9A5'}
            sublabel={kpi.overdueCount > 0 ? 'Requires attention' : 'Zero blockers'}
            trend={kpi.overdueCount > 0 ? 'Critical' : 'Clear'}
          />
        </div>

        {/* ── Charts Row 1: Task Distribution + Project Performance ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', marginBottom: '24px' }} className="charts-main-grid">
          {/* Interactive Donut Chart */}
          <div className="card" style={{ background: '#161820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px' }}>
            <div className="card-header" style={{ marginBottom: 16 }}>
              <div>
                <span className="card-title">Task Distribution</span>
                <p style={{ fontSize: '0.75rem', color: '#6D6F7C', margin: '2px 0 0' }}>Status balance across active queue</p>
              </div>
            </div>

            {kpi.totalTasks === 0 ? (
              <EmptyState icon="📊" title="No tasks yet" />
            ) : (
              <div style={{ position: 'relative' }}>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={charts.taskStatusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {charts.taskStatusBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Metric Display */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F4F2EE', lineHeight: 1 }}>
                    {kpi.totalTasks}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6D6F7C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Tasks
                  </div>
                </div>

                {/* Legend list */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', justifyContent: 'center', marginTop: 12 }}>
                  {charts.taskStatusBreakdown.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                      <span style={{ color: '#A5A5B0' }}>{item.name}:</span>
                      <strong style={{ color: '#F4F2EE' }}>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Project Performance Overview with Animated Progress Bars */}
          <div className="card" style={{ background: '#161820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px' }}>
            <div className="card-header" style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="card-title">Project Performance &amp; Completion</span>
                <p style={{ fontSize: '0.75rem', color: '#6D6F7C', margin: '2px 0 0' }}>Real-time health and progress indices</p>
              </div>
              <Link
                to="/projects"
                style={{ fontSize: '0.8rem', color: '#9B8AFB', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontWeight: 600 }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {projectTwins.length === 0 ? (
                <EmptyState icon="📁" title="No projects currently active" />
              ) : (
                projectTwins.map((p) => {
                  const healthColor =
                    p.health === 'On Track' ? '#72C9A5' : p.health === 'Delayed' ? '#E47C82' : '#E7B86C';

                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: '12px 14px',
                        background: '#101116',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Link
                          to={`/projects/${p.id}`}
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#F4F2EE',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <span>{p.name}</span>
                          <span
                            style={{
                              fontSize: '0.675rem',
                              color: healthColor,
                              background: `rgba(${healthColor === '#72C9A5' ? '114, 201, 165' : healthColor === '#E47C82' ? '228, 124, 130' : '231, 184, 108'}, 0.12)`,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontWeight: 600,
                            }}
                          >
                            {p.health}
                          </span>
                        </Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '0.785rem', color: '#A5A5B0' }}>
                            {p.taskCount || 0} tasks
                          </span>
                          <strong style={{ fontSize: '0.875rem', color: '#F4F2EE', fontVariantNumeric: 'tabular-nums' }}>
                            {p.progress}%
                          </strong>
                        </div>
                      </div>

                      {/* Smooth Rounded Progress Bar */}
                      <div
                        style={{
                          width: '100%',
                          height: '7px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.07)',
                          overflow: 'hidden',
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.progress}%` }}
                          transition={{ duration: 0.65, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            background: `linear-gradient(90deg, #9B8AFB, ${healthColor})`,
                            borderRadius: '10px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Charts Row 2: Team Workload & Upcoming Deadlines ──── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }} className="charts-split-grid">
          {/* Team Workload Chart */}
          <div className="card" style={{ background: '#161820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px' }}>
            <div className="card-header" style={{ marginBottom: 16 }}>
              <div>
                <span className="card-title">Team Workload Distribution</span>
                <p style={{ fontSize: '0.75rem', color: '#6D6F7C', margin: '2px 0 0' }}>Active load per specialist</p>
              </div>
            </div>

            {charts.workloadChart.length === 0 ? (
              <EmptyState icon="👥" title="No team members assigned" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={charts.workloadChart} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6D6F7C', fontSize: 11 }}
                    tickFormatter={(v) => v.split(' ')[0]}
                  />
                  <YAxis tick={{ fill: '#6D6F7C', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ color: '#A5A5B0', fontSize: '0.785rem' }}>{v}</span>}
                  />
                  <Bar dataKey="done" name="Completed" fill="#72C9A5" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="inProgress" name="In Progress" fill="#9B8AFB" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="todo" name="To Do" fill="#22252E" radius={[2, 2, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Upcoming Deadlines & Overdue Watch */}
          <div className="card" style={{ background: '#161820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px' }}>
            <div className="card-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="card-title">Upcoming Work Items &amp; Deadlines</span>
                <p style={{ fontSize: '0.75rem', color: '#6D6F7C', margin: '2px 0 0' }}>Next priority deliverables</p>
              </div>
              <Link
                to="/tasks"
                style={{ fontSize: '0.8rem', color: '#9B8AFB', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontWeight: 600 }}
              >
                <span>Task Board</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingTasks.length === 0 ? (
                <EmptyState icon="✅" title="No upcoming deadlines" />
              ) : (
                upcomingTasks.slice(0, 4).map((t) => {
                  const isPast = new Date(t.deadline) < new Date() && t.status !== 'Done' && t.status !== 'Completed';

                  return (
                    <div
                      key={t._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '11px 14px',
                        background: '#101116',
                        borderRadius: '10px',
                        border: `1px solid ${isPast ? 'rgba(228, 124, 130, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                      }}
                    >
                      <div style={{ overflow: 'hidden', flex: 1, paddingRight: 10 }}>
                        <div style={{ fontSize: '0.835rem', fontWeight: 600, color: '#F4F2EE' }} className="truncate">
                          {t.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6D6F7C', display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                          <span>{t.project?.name || 'Project'}</span>
                          <span>·</span>
                          <span style={{ color: isPast ? '#E47C82' : '#A5A5B0' }}>
                            {t.deadline ? format(new Date(t.deadline), 'MMM d') : 'No date'}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          color: t.priority === 'High' || t.priority === 'Critical' ? '#E7B86C' : '#9B8AFB',
                          background: 'rgba(255,255,255,0.05)',
                        }}
                      >
                        {t.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Intelligence Quick Launch Banner ──────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(155, 138, 251, 0.12) 0%, rgba(120, 220, 232, 0.08) 100%)',
            border: '1px solid rgba(155, 138, 251, 0.25)',
            borderRadius: '16px',
            padding: '22px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #9B8AFB, #78DCE8)',
                color: '#101116',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(155, 138, 251, 0.3)',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F4F2EE', margin: 0 }}>
                Digital Twin AI Predictive Intelligence Engine
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#A5A5B0', margin: '3px 0 0' }}>
                Simulate project delivery dates, run Monte Carlo schedule permutations, and forecast team risk bottlenecks.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playSuccess();
              setActiveModal('intel');
            }}
            className="btn btn-primary"
            style={{ padding: '9px 20px', fontSize: '0.85rem' }}
          >
            <Sparkles size={15} />
            <span>Launch Simulation Engine</span>
          </button>
        </div>
      </div>

      {/* ── Functional Action Modals ─────────────────────────────── */}
      {activeModal === 'project' && (
        <ProjectModal
          mode="create"
          teamMembers={teamList}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            fetchData();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === 'task' && (
        <TaskModal
          mode="create"
          projects={projectsList}
          teamMembers={teamList}
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            fetchData();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === 'team' && (
        <TeamModal
          mode="create"
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            fetchData();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === 'intel' && (
        <IntelligenceModal
          isOpen={true}
          mode="predictions"
          onClose={() => setActiveModal(null)}
        />
      )}

      <style>{`
        @media (max-width: 1200px) {
          .kpi-six-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .charts-main-grid {
            grid-template-columns: 1fr !important;
          }
          .charts-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .kpi-six-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

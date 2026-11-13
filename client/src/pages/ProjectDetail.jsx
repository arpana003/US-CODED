import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Cpu, AlertTriangle, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';
import { projectsApi, tasksApi, teamApi } from '../services/api';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { fmt, getStatusBadgeClass, getTaskStatusBadgeClass, getPriorityBadgeClass, getHealthBadgeClass, isOverdue } from '../utils/helpers';
import Topbar from '../components/layout/Topbar';
import { Spinner } from '../components/common/LoadingStates';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';
import TaskModal from '../components/tasks/TaskModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [twin, setTwin] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [taskModal, setTaskModal] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, twinRes, tasksRes, teamRes] = await Promise.all([
        projectsApi.getOne(id),
        projectsApi.getTwin(id),
        tasksApi.getAll({ project: id }),
        teamApi.getAll(),
      ]);
      setProject(pRes.data);
      setTwin(twinRes.data);
      setTasks(tasksRes.data);
      setTeamMembers(teamRes.data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useSocketEvents(['task:created', 'task:updated', 'task:deleted', 'project:updated'], fetchAll);

  const handleDeleteTask = async () => {
    if (!deleteTask) return;
    setDeleting(true);
    try {
      await tasksApi.delete(deleteTask._id);
      toast.success('Task deleted');
      setDeleteTask(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div><Topbar title="Project" /><div style={{ marginTop: 80 }}><Spinner /></div></div>;
  if (!project) return <div className="page-container"><p>Project not found.</p></div>;

  const health = twin?.health;
  const metrics = twin?.metrics;
  const healthColors = { 'On Track': 'var(--clr-success)', 'At Risk': 'var(--clr-warning)', Delayed: 'var(--clr-danger)' };
  const healthBg = { 'On Track': 'var(--clr-success-dim)', 'At Risk': 'var(--clr-warning-dim)', Delayed: 'var(--clr-danger-dim)' };

  const tabStyles = (tab) => ({
    padding: '8px 18px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: activeTab === tab ? 'var(--clr-primary-dim)' : 'transparent',
    color: activeTab === tab ? 'var(--clr-primary)' : 'var(--clr-text-2)',
    transition: 'all 0.15s',
  });

  return (
    <div>
      <Topbar title={project.name} subtitle={`Project detail · Digital Twin v${twin?.twinVersion || '1.0'}`} />
      <div className="page-container">

        {/* Back */}
        <Link to="/projects" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to Projects
        </Link>

        {/* Project header */}
        <div className="card" style={{ marginBottom: 20, borderLeft: `4px solid ${project.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 style={{ fontSize: '1.5rem' }}>{project.name}</h1>
                <span className={`badge ${getStatusBadgeClass(project.status)}`}>{project.status}</span>
              </div>
              {project.description && <p style={{ fontSize: '0.875rem', marginBottom: 12 }}>{project.description}</p>}
              <div style={{ display: 'flex', gap: 20, fontSize: '0.8125rem', color: 'var(--clr-text-3)', flexWrap: 'wrap' }}>
                <span>📅 Started: {fmt.date(project.startDate)}</span>
                <span>⏰ Deadline: {fmt.date(project.deadline)}</span>
                <span>📊 Progress: <strong style={{ color: 'var(--clr-text)' }}>{project.progress}%</strong></span>
                {metrics && <span>📆 {metrics.daysRemaining > 0 ? `${metrics.daysRemaining} days remaining` : `${Math.abs(metrics.daysRemaining)} days overdue`}</span>}
              </div>
            </div>

            {/* Health badge */}
            {health && (
              <div style={{ padding: '12px 20px', background: healthBg[health.status], borderRadius: 'var(--radius-lg)', textAlign: 'center', minWidth: 140 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 4 }}>
                  <Cpu size={16} color={healthColors[health.status]} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: healthColors[health.status], textTransform: 'uppercase' }}>Digital Twin</span>
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: healthColors[health.status] }}>{health.status}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-3)', marginTop: 4, maxWidth: 160 }}>{health.reason}</div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 16 }}>
            <div className="progress-bar-wrap" style={{ height: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${project.progress}%`, background: project.color }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--clr-surface)', padding: 6, borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
          {['overview', 'tasks', 'twin', 'team'].map((tab) => (
            <button key={tab} style={tabStyles(tab)} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ─────────────────────────────────────── */}
        {activeTab === 'overview' && metrics && (
          <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 20 }}>
            {[
              { label: 'Total Tasks', value: metrics.totalTasks },
              { label: 'Completed', value: metrics.doneTasks, color: 'var(--clr-success)' },
              { label: 'In Progress', value: metrics.inProgressTasks, color: 'var(--clr-primary)' },
              { label: 'Overdue', value: metrics.overdueCount, color: 'var(--clr-danger)' },
            ].map((item) => (
              <div key={item.label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: item.color || 'var(--clr-text)', marginBottom: 4 }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--clr-text-3)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tasks Tab ─────────────────────────────────────────── */}
        {activeTab === 'tasks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button className="btn btn-primary" onClick={() => setTaskModal({ mode: 'create' })}>
                <Plus size={15} /> Add Task
              </button>
            </div>
            {tasks.length === 0 ? (
              <div className="card">
                <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--clr-text-3)' }}>No tasks yet. Add the first one!</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 0 }}>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Assigned</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Deadline</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t) => (
                        <tr key={t._id} style={isOverdue(t.deadline, t.status) ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                          <td>
                            <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.title}</div>
                            {t.issueNotes && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--clr-warning)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <AlertTriangle size={11} /> {t.issueNotes.slice(0, 60)}{t.issueNotes.length > 60 ? '…' : ''}
                              </div>
                            )}
                          </td>
                          <td>
                            {t.assignedTo ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Avatar name={t.assignedTo.name} size="sm" />
                                <span style={{ fontSize: '0.8125rem' }}>{t.assignedTo.name}</span>
                              </div>
                            ) : <span style={{ color: 'var(--clr-text-3)', fontSize: '0.8125rem' }}>Unassigned</span>}
                          </td>
                          <td><span className={`badge ${getPriorityBadgeClass(t.priority)}`}>{t.priority}</span></td>
                          <td><span className={`badge ${getTaskStatusBadgeClass(t.status)}`}>{t.status}</span></td>
                          <td>
                            <span style={{ fontSize: '0.8125rem', color: isOverdue(t.deadline, t.status) ? 'var(--clr-danger)' : 'var(--clr-text-2)' }}>
                              {fmt.date(t.deadline)}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setTaskModal({ mode: 'edit', task: t })}><Edit2 size={13} /></button>
                              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setDeleteTask(t)} style={{ color: 'var(--clr-danger)' }}><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Digital Twin Tab ──────────────────────────────────── */}
        {activeTab === 'twin' && twin && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Cpu size={20} color="var(--clr-primary)" />
              <h3>Digital Twin Snapshot</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>
                Generated {fmt.relative(twin.snapshotAt)}
              </span>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              {/* Health */}
              <div className="card" style={{ background: healthBg[health.status] }}>
                <div className="card-header" style={{ marginBottom: 12 }}>
                  <span className="card-title">Health Assessment</span>
                  <span className={`badge ${getHealthBadgeClass(health.status)}`}>{health.status}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-2)' }}>{health.reason}</p>
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--clr-text-3)', fontStyle: 'italic' }}>
                  ⚙️ Rule-based logic (Phase 1). AI/ML prediction replaces this in Phase 2.
                </div>
              </div>

              {/* Progress vs Expected */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: 12 }}>
                  <span className="card-title">Progress Analysis</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Actual Progress', value: `${metrics.progress}%`, color: project.color },
                    { label: 'Expected Progress', value: `${metrics.expectedProgress}%`, color: 'var(--clr-text-3)' },
                    {
                      label: 'Delta',
                      value: `${metrics.progressDelta >= 0 ? '+' : ''}${metrics.progressDelta}%`,
                      color: metrics.progressDelta >= 0 ? 'var(--clr-success)' : 'var(--clr-danger)',
                    },
                    { label: 'Days Remaining', value: metrics.daysRemaining, color: metrics.daysRemaining < 0 ? 'var(--clr-danger)' : 'var(--clr-text)' },
                    { label: 'Overdue Tasks', value: metrics.overdueCount, color: metrics.overdueCount > 0 ? 'var(--clr-danger)' : 'var(--clr-success)' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--clr-border-2)' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--clr-text-3)' }}>{item.label}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Workload */}
            {twin.team.workload.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><span className="card-title">Workload per Member</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {twin.team.workload.map((w) => (
                    <div key={w.memberId} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Avatar name={w.memberName} size="sm" />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{w.memberName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>{w.doneTasks}/{w.totalTasks} done</span>
                        </div>
                        <div className="progress-bar-wrap" style={{ height: 5 }}>
                          <div className="progress-bar-fill" style={{ width: `${w.totalTasks > 0 ? (w.doneTasks / w.totalTasks) * 100 : 0}%` }} />
                        </div>
                      </div>
                      {w.overdueTasks > 0 && <span className="badge badge-danger">{w.overdueTasks} overdue</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues */}
            {twin.tasks.issues.length > 0 && (
              <div className="card">
                <div className="card-header"><span className="card-title">Active Issues</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {twin.tasks.issues.map((issue) => (
                    <div key={issue.taskId} style={{ padding: '12px 16px', background: 'var(--clr-warning-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{issue.taskTitle}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--clr-text-2)' }}>{issue.issueNote}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <span className={`badge ${getPriorityBadgeClass(issue.priority)}`}>{issue.priority}</span>
                        <span className={`badge ${getTaskStatusBadgeClass(issue.status)}`}>{issue.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Team Tab ──────────────────────────────────────────── */}
        {activeTab === 'team' && (
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {(project.team || []).length === 0 ? (
              <p style={{ color: 'var(--clr-text-3)' }}>No team members assigned.</p>
            ) : (
              (project.team || []).map((m) => (
                <div key={m._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Avatar name={m.name} size="lg" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--clr-text-3)', marginBottom: 4 }}>{m.role}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-3)' }}>{m.email}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {taskModal && (
        <TaskModal
          mode={taskModal.mode}
          task={taskModal.task}
          projectId={id}
          teamMembers={project.team || []}
          onClose={() => setTaskModal(null)}
          onSuccess={() => { setTaskModal(null); fetchAll(); }}
        />
      )}

      {deleteTask && (
        <ConfirmDialog
          title="Delete Task"
          message={`Delete "${deleteTask.title}"?`}
          onConfirm={handleDeleteTask}
          onCancel={() => setDeleteTask(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

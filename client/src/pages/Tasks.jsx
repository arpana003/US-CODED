import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, AlertTriangle, Kanban, List, Calendar as CalendarIcon,
  CheckCircle2, Clock, FolderKanban, Users, ShieldAlert, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { tasksApi, projectsApi, teamApi } from '../services/api';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { fmt, isOverdue } from '../utils/helpers';
import sound from '../utils/sound';
import Topbar from '../components/layout/Topbar';
import { Spinner, EmptyState } from '../components/common/LoadingStates';
import Avatar from '../components/common/Avatar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TaskModal from '../components/tasks/TaskModal';
import toast from 'react-hot-toast';

const KANBAN_COLUMNS = [
  { id: 'To Do', label: 'To Do', color: '#6D6F7C', bg: 'rgba(109, 111, 124, 0.12)' },
  { id: 'In Progress', label: 'In Progress', color: '#9B8AFB', bg: 'rgba(155, 138, 251, 0.12)' },
  { id: 'Under Review', label: 'Under Review', color: '#E7B86C', bg: 'rgba(231, 184, 108, 0.12)' },
  { id: 'Completed', label: 'Completed', color: '#72C9A5', bg: 'rgba(114, 201, 165, 0.12)' },
  { id: 'Blocked', label: 'Blocked', color: '#E47C82', bg: 'rgba(228, 124, 130, 0.12)' },
];

const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Critical'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'kanban' | 'table' | 'calendar'
  const [viewMode, setViewMode] = useState('kanban');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('');

  // Modals
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', task? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Calendar view month state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchAll = useCallback(async () => {
    try {
      const [tRes, pRes, teamRes] = await Promise.allSettled([
        tasksApi.getAll(),
        projectsApi.getAll(),
        teamApi.getAll(),
      ]);

      if (tRes.status === 'fulfilled') setTasks(tRes.value?.data || []);
      if (pRes.status === 'fulfilled') setProjects(pRes.value?.data || []);
      if (teamRes.status === 'fulfilled') setTeamMembers(teamRes.value?.data || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load task queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useSocketEvents(['task:created', 'task:updated', 'task:deleted'], fetchAll);

  const filteredTasks = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'All' || t.status === statusFilter || (statusFilter === 'Completed' && t.status === 'Done');
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchProject = !projectFilter || t.project?._id === projectFilter || t.project === projectFilter;
    return matchSearch && matchStatus && matchPriority && matchProject;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tasksApi.delete(deleteTarget._id);
      sound.playSuccess();
      toast.success('Task removed');
      setDeleteTarget(null);
      fetchAll();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    sound.playClick();
    try {
      await tasksApi.update(task._id, {
        ...task,
        status: newStatus,
        project: task.project?._id || task.project,
        assignedTo: task.assignedTo?._id || task.assignedTo || undefined,
      });
      sound.playSuccess();
      toast.success(`Task moved to ${newStatus}`);
      fetchAll();
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Calendar dates
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div>
      <Topbar title="Task Management" subtitle={`${tasks.length} tasks scheduled across work streams`} />

      <div className="page-container">
        {/* Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="page-title">
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F4F2EE', letterSpacing: '-0.02em', margin: 0 }}>
              Task Management
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#A5A5B0', marginTop: 4 }}>
              Plan, assign, and track every task in one place with interactive multi-view orchestration.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                sound.playClick();
                setModal({ mode: 'create' });
              }}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              <span>New Task</span>
            </button>
          </div>
        </motion.div>

        {/* View Switcher & Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          {/* Search & Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#15161B',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '0 12px',
                height: 38,
                minWidth: 220,
              }}
            >
              <Search size={14} color="#9B8AFB" />
              <input
                type="text"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#F4F2EE',
                  fontSize: '0.85rem',
                  width: '100%',
                }}
              />
            </div>

            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={(e) => {
                sound.playClick();
                setProjectFilter(e.target.value);
              }}
              style={{
                height: 38,
                padding: '0 12px',
                background: '#15161B',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                color: '#F4F2EE',
                fontSize: '0.8125rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                sound.playClick();
                setStatusFilter(e.target.value);
              }}
              style={{
                height: 38,
                padding: '0 12px',
                background: '#15161B',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                color: '#F4F2EE',
                fontSize: '0.8125rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All">All Statuses</option>
              <option value="To Do">Status: To Do</option>
              <option value="In Progress">Status: In Progress</option>
              <option value="Under Review">Status: Under Review</option>
              <option value="Completed">Status: Completed</option>
              <option value="Blocked">Status: Blocked</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                sound.playClick();
                setPriorityFilter(e.target.value);
              }}
              style={{
                height: 38,
                padding: '0 12px',
                background: '#15161B',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                color: '#F4F2EE',
                fontSize: '0.8125rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  Priority: {p}
                </option>
              ))}
            </select>
          </div>

          {/* Three View Mode Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '3px',
              gap: 3,
            }}
          >
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setViewMode('kanban');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                background: viewMode === 'kanban' ? 'rgba(155, 138, 251, 0.2)' : 'transparent',
                color: viewMode === 'kanban' ? '#B5A5FF' : '#6D6F7C',
                fontSize: '0.8125rem',
                fontWeight: viewMode === 'kanban' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Kanban size={15} />
              <span>Kanban</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setViewMode('table');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                background: viewMode === 'table' ? 'rgba(155, 138, 251, 0.2)' : 'transparent',
                color: viewMode === 'table' ? '#B5A5FF' : '#6D6F7C',
                fontSize: '0.8125rem',
                fontWeight: viewMode === 'table' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <List size={15} />
              <span>Table</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setViewMode('calendar');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                background: viewMode === 'calendar' ? 'rgba(155, 138, 251, 0.2)' : 'transparent',
                color: viewMode === 'calendar' ? '#B5A5FF' : '#6D6F7C',
                fontSize: '0.8125rem',
                fontWeight: viewMode === 'calendar' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <CalendarIcon size={15} />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        {/* ── View Content ───────────────────────────────────────── */}
        {loading ? (
          <Spinner text="Loading task pipeline…" />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No tasks match the active filters"
            description="Adjust your search criteria or create a new task."
            action={
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setModal({ mode: 'create' })}
              >
                <Plus size={16} /> Create Task
              </button>
            }
          />
        ) : viewMode === 'kanban' ? (
          /* 1. Master Kanban Board */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
              overflowX: 'auto',
              minHeight: '65vh',
              alignItems: 'start',
            }}
            className="kanban-columns-wrap"
          >
            {KANBAN_COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter(
                (t) =>
                  t.status === col.id ||
                  (col.id === 'Completed' && t.status === 'Done')
              );

              return (
                <div
                  key={col.id}
                  style={{
                    background: '#15161B',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: 10,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: col.color,
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F4F2EE' }}>
                        {col.label}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '10px',
                        background: col.bg,
                        color: col.color,
                      }}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task Cards in Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '80px' }}>
                    {colTasks.map((t) => (
                      <KanbanCard
                        key={t._id}
                        task={t}
                        onEdit={() => setModal({ mode: 'edit', task: t })}
                        onDelete={() => setDeleteTarget(t)}
                        onStatusChange={(newSt) => handleStatusChange(t, newSt)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'table' ? (
          /* 2. Table View */
          <div
            style={{
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: '#101116' }}>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Task Title</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Project</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Assignee</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Priority</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Deadline</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => {
                  const overdue = isOverdue(t.deadline, t.status);
                  return (
                    <tr
                      key={t._id}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#F4F2EE' }}>{t.title}</div>
                        {t.instructions && (
                          <div style={{ fontSize: '0.72rem', color: '#A5A5B0', marginTop: 2 }}>
                            {t.instructions.slice(0, 50)}…
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#78DCE8', fontSize: '0.8125rem' }}>
                        {t.project?.name || 'Project'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {t.assignedTo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar name={t.assignedTo.name} size="sm" />
                            <span style={{ fontSize: '0.8125rem', color: '#F4F2EE' }}>
                              {t.assignedTo.name.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#6D6F7C', fontSize: '0.8125rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.05)',
                            color: t.priority === 'High' || t.priority === 'Critical' ? '#E7B86C' : '#9B8AFB',
                          }}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <select
                          value={t.status === 'Done' ? 'Completed' : t.status}
                          onChange={(e) => handleStatusChange(t, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            background: '#101116',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            color: '#F4F2EE',
                            fontSize: '0.785rem',
                            cursor: 'pointer',
                          }}
                        >
                          {KANBAN_COLUMNS.map((col) => (
                            <option key={col.id} value={col.id}>
                              {col.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: overdue ? '#E47C82' : '#A5A5B0' }}>
                        {t.deadline ? fmt.date(t.deadline) : '—'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-icon btn-ghost btn-sm"
                            onClick={() => setModal({ mode: 'edit', task: t })}
                            title="Edit Task"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-icon btn-ghost btn-sm"
                            onClick={() => setDeleteTarget(t)}
                            title="Delete Task"
                            style={{ color: '#E47C82' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* 3. Calendar View */
          <div
            style={{
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F4F2EE', margin: 0 }}>
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
              }}
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#6D6F7C', paddingBottom: 6 }}>
                  {d}
                </div>
              ))}

              {daysInMonth.map((day) => {
                const dayTasks = filteredTasks.filter(
                  (t) => t.deadline && isSameDay(new Date(t.deadline), day)
                );

                return (
                  <div
                    key={day.toISOString()}
                    style={{
                      minHeight: '90px',
                      background: '#101116',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#A5A5B0' }}>
                      {format(day, 'd')}
                    </span>
                    {dayTasks.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => setModal({ mode: 'edit', task: t })}
                        style={{
                          fontSize: '0.7rem',
                          background: 'rgba(155, 138, 251, 0.16)',
                          color: '#B5A5FF',
                          padding: '3px 6px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <TaskModal
          mode={modal.mode}
          task={modal.task}
          projects={projects}
          teamMembers={teamMembers}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            fetchAll();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${deleteTarget.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <style>{`
        @media (max-width: 1200px) {
          .kanban-columns-wrap {
            grid-template-columns: repeat(3, 280px) !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Master Kanban Card ─────────────────────────────────────────────
function KanbanCard({ task, onEdit, onStatusChange }) {
  const isPast =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== 'Done' &&
    task.status !== 'Completed';

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      style={{
        background: '#101116',
        border: `1px solid ${isPast ? 'rgba(228, 124, 130, 0.3)' : 'rgba(255, 255, 255, 0.07)'}`,
        borderRadius: '12px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      }}
      onClick={onEdit}
    >
      {/* Top Project Tag + Priority */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.675rem',
            color: '#78DCE8',
            fontWeight: 600,
            textTransform: 'uppercase',
            background: 'rgba(120, 220, 232, 0.1)',
            padding: '2px 7px',
            borderRadius: '4px',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {task.project?.name || 'Project'}
        </span>

        <span
          style={{
            fontSize: '0.675rem',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.05)',
            color: task.priority === 'High' || task.priority === 'Critical' ? '#E7B86C' : '#9B8AFB',
          }}
        >
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F4F2EE', lineHeight: 1.35 }}>
        {task.title}
      </div>

      {/* Instructions indicator */}
      {task.instructions && (
        <div style={{ fontSize: '0.72rem', color: '#A5A5B0', lineHeight: 1.4, background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: 6 }}>
          {task.instructions.slice(0, 55)}…
        </div>
      )}

      {/* Card Footer: Assignee, Deadline & Quick Status Picker */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 8,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {task.assignedTo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={task.assignedTo.name}>
              <Avatar name={task.assignedTo.name} size="xs" />
              <span style={{ fontSize: '0.75rem', color: '#A5A5B0' }}>
                {task.assignedTo.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: '0.72rem', color: '#6D6F7C' }}>Unassigned</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {task.deadline && (
            <span style={{ fontSize: '0.72rem', color: isPast ? '#E47C82' : '#6D6F7C' }}>
              {format(new Date(task.deadline), 'MMM d')}
            </span>
          )}

          <select
            value={task.status === 'Done' ? 'Completed' : task.status}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: '#F4F2EE',
              fontSize: '0.675rem',
              padding: '2px 4px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {KANBAN_COLUMNS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
}

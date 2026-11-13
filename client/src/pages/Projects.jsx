import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Eye, Calendar, Users, LayoutGrid, List,
  CheckSquare, ArrowRight, ShieldCheck, Sparkles, FolderKanban
} from 'lucide-react';
import { projectsApi, teamApi } from '../services/api';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { fmt, getStatusBadgeClass } from '../utils/helpers';
import sound from '../utils/sound';
import Topbar from '../components/layout/Topbar';
import { Spinner, EmptyState } from '../components/common/LoadingStates';
import { AvatarStack } from '../components/common/Avatar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import ProjectModal from '../components/projects/ProjectModal';

const STATUS_OPTIONS = ['All', 'Planning', 'Active', 'Completed', 'On Hold'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', project? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([projectsApi.getAll(), teamApi.getAll()]);
      setProjects(pRes.data || []);
      setTeamMembers(tRes.data || []);
    } catch (e) {
      toast.error(e.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useSocketEvents(['project:created', 'project:updated', 'project:deleted'], fetchAll);

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectsApi.delete(deleteTarget._id);
      sound.playSuccess();
      toast.success('Project deleted successfully');
      setDeleteTarget(null);
      fetchAll();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <Topbar title="Projects" subtitle={`${projects.length} project ecosystems under supervision`} />

      <div className="page-container">
        {/* Header Section */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="page-title">
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F4F2EE', letterSpacing: '-0.02em', margin: 0 }}>
              Your Projects
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#A5A5B0', marginTop: 4 }}>
              Manage, monitor, and move every project forward with digital twin intelligence.
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
              <span>New Project</span>
            </button>
          </div>
        </motion.div>

        {/* Filter and View Bar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280, maxWidth: 520 }}>
            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#15161B',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '0 14px',
                height: 40,
                flex: 1,
              }}
            >
              <Search size={15} color="#9B8AFB" />
              <input
                type="text"
                placeholder="Search projects by name, keyword…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#F4F2EE',
                  fontSize: '0.875rem',
                  width: '100%',
                }}
              />
            </div>

            {/* Status Pills */}
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStatusFilter(s);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: statusFilter === s ? 'rgba(155, 138, 251, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                    background: statusFilter === s ? 'rgba(155, 138, 251, 0.15)' : '#15161B',
                    color: statusFilter === s ? '#F4F2EE' : '#A5A5B0',
                    fontSize: '0.785rem',
                    fontWeight: statusFilter === s ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grid vs List View Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '9px',
              padding: '3px',
              gap: 2,
            }}
          >
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setViewMode('grid');
              }}
              title="Grid View"
              style={{
                width: 32,
                height: 32,
                borderRadius: 7,
                border: 'none',
                background: viewMode === 'grid' ? 'rgba(155, 138, 251, 0.2)' : 'transparent',
                color: viewMode === 'grid' ? '#B5A5FF' : '#6D6F7C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setViewMode('list');
              }}
              title="List View"
              style={{
                width: 32,
                height: 32,
                borderRadius: 7,
                border: 'none',
                background: viewMode === 'list' ? 'rgba(155, 138, 251, 0.2)' : 'transparent',
                color: viewMode === 'list' ? '#B5A5FF' : '#6D6F7C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Project Content */}
        {loading ? (
          <Spinner text="Loading projects…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📁"
            title={search || statusFilter !== 'All' ? 'No matching projects found' : 'No projects created yet'}
            description={
              search || statusFilter !== 'All'
                ? 'Try adjusting your search query or reset the status filters.'
                : 'Create your first project digital twin to start planning.'
            }
            action={
              !search && statusFilter === 'All' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setModal({ mode: 'create' })}
                >
                  <Plus size={16} /> Create Project
                </button>
              )
            }
          />
        ) : viewMode === 'grid' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '20px',
            }}
          >
            {filtered.map((p, idx) => (
              <ProjectCard
                key={p._id}
                project={p}
                index={idx}
                onEdit={() => setModal({ mode: 'edit', project: p })}
                onDelete={() => setDeleteTarget(p)}
              />
            ))}
          </div>
        ) : (
          /* List View Table */
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
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Project</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Progress</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Deadline</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p._id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <Link to={`/projects/${p._id}`} style={{ fontWeight: 600, color: '#F4F2EE', textDecoration: 'none' }}>
                        {p.name}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: '#A5A5B0', marginTop: 2 }}>
                        {p.description ? p.description.slice(0, 50) + '…' : 'No description'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge ${getStatusBadgeClass(p.status)}`}>{p.status}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 100, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                          <div style={{ width: `${p.progress || 0}%`, height: '100%', background: '#9B8AFB' }} />
                        </div>
                        <span style={{ fontSize: '0.785rem', color: '#F4F2EE', fontVariantNumeric: 'tabular-nums' }}>
                          {p.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#A5A5B0', fontSize: '0.8125rem' }}>
                      {p.deadline ? fmt.date(p.deadline) : '—'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <Link
                          to={`/projects/${p._id}`}
                          className="btn btn-icon btn-ghost btn-sm"
                          title="Open Digital Twin"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-icon btn-ghost btn-sm"
                          onClick={() => setModal({ mode: 'edit', project: p })}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon btn-ghost btn-sm"
                          onClick={() => setDeleteTarget(p)}
                          title="Delete"
                          style={{ color: '#E47C82' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <ProjectModal
          mode={modal.mode}
          project={modal.project}
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
          title="Delete Project"
          message={`Are you sure you want to delete "${deleteTarget.name}"? All associated tasks will also be deleted.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

// ── Master Project Card ────────────────────────────────────────────
function ProjectCard({ project, onEdit, onDelete, index }) {
  const daysLeft = fmt.daysLeft(project.deadline);
  const isOverdue = daysLeft < 0 && project.status !== 'Completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      style={{
        background: '#15161B',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${project.color || '#9B8AFB'}, transparent)`,
        }}
      />

      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Link
              to={`/projects/${project._id}`}
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#F4F2EE',
                textDecoration: 'none',
                display: 'block',
                marginBottom: 4,
                lineHeight: 1.35,
              }}
              className="truncate"
            >
              {project.name}
            </Link>
            <span className={`badge ${getStatusBadgeClass(project.status)}`}>{project.status}</span>
          </div>

          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <Link
              to={`/projects/${project._id}`}
              className="btn btn-icon btn-ghost btn-sm"
              title="Open Digital Twin"
            >
              <Eye size={14} />
            </Link>
            <button
              type="button"
              className="btn btn-icon btn-ghost btn-sm"
              onClick={onEdit}
              title="Edit Project"
            >
              <Edit2 size={14} />
            </button>
            <button
              type="button"
              className="btn btn-icon btn-ghost btn-sm"
              onClick={onDelete}
              title="Delete Project"
              style={{ color: '#E47C82' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <p
          style={{
            fontSize: '0.8125rem',
            color: '#A5A5B0',
            lineHeight: 1.5,
            marginBottom: 16,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description || 'No project description recorded.'}
        </p>

        {/* Progress Bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', color: '#6D6F7C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completion Progress
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F4F2EE', fontVariantNumeric: 'tabular-nums' }}>
              {project.progress || 0}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress || 0}%` }}
              transition={{ duration: 0.6 }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, #9B8AFB, #78DCE8)`,
                borderRadius: '10px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Card Footer: Dates & Team */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 14,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.785rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isOverdue ? '#E47C82' : '#A5A5B0' }}>
          <Calendar size={13} color={isOverdue ? '#E47C82' : '#9B8AFB'} />
          <span>
            {project.deadline ? fmt.date(project.deadline) : 'No deadline'}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>

        <div>
          {project.team && project.team.length > 0 ? (
            <AvatarStack members={project.team} max={3} />
          ) : (
            <span style={{ fontSize: '0.72rem', color: '#6D6F7C' }}>No members</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

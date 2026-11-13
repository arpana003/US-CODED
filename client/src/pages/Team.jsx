import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Mail, Briefcase, Search, Users, FolderKanban,
  CheckCircle2, LayoutGrid, List, Sparkles, Shield
} from 'lucide-react';
import { teamApi, projectsApi } from '../services/api';
import { useSocketEvents } from '../hooks/useSocketEvents';
import sound from '../utils/sound';
import Topbar from '../components/layout/Topbar';
import { Spinner, EmptyState } from '../components/common/LoadingStates';
import Avatar from '../components/common/Avatar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import TeamModal from '../components/team/TeamModal';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [mRes, pRes] = await Promise.allSettled([teamApi.getAll(), projectsApi.getAll()]);
      if (mRes.status === 'fulfilled') setMembers(mRes.value?.data || []);
      if (pRes.status === 'fulfilled') setProjects(pRes.value?.data || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useSocketEvents(['team:created', 'team:updated', 'team:deleted'], fetchAll);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q);
    const matchRole =
      selectedRole === 'All' ||
      (selectedRole === 'Lead' && m.role.toLowerCase().includes('lead')) ||
      (selectedRole === 'Engineering' && (m.role.toLowerCase().includes('engineer') || m.role.toLowerCase().includes('developer'))) ||
      (selectedRole === 'QA' && m.role.toLowerCase().includes('qa'));
    return matchSearch && matchRole;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await teamApi.delete(deleteTarget._id);
      sound.playSuccess();
      toast.success('Team member removed');
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
      <Topbar title="Team Management" subtitle={`${members.length} verified engineering specialists active`} />

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
              Your Team
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#A5A5B0', marginTop: 4 }}>
              Manage people, responsibilities, project allocations, and team performance.
            </p>
          </div>

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
            <span>Add Team Member</span>
          </button>
        </motion.div>

        {/* Filter Bar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280, maxWidth: 540 }}>
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
                placeholder="Search by name, role, email…"
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

            {/* Quick Role Filters */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'Lead', 'Engineering', 'QA'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedRole(r);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedRole === r ? 'rgba(155, 138, 251, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                    background: selectedRole === r ? 'rgba(155, 138, 251, 0.15)' : '#15161B',
                    color: selectedRole === r ? '#F4F2EE' : '#A5A5B0',
                    fontSize: '0.785rem',
                    fontWeight: selectedRole === r ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle */}
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
              title="Table View"
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

        {/* Members List */}
        {loading ? (
          <Spinner text="Loading roster telemetry…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title={search ? 'No matching members found' : 'No team members added yet'}
            description={
              search ? 'Try adjusting your search criteria.' : 'Add your first engineering specialist to assign tasks.'
            }
            action={
              !search && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setModal({ mode: 'create' })}
                >
                  <Plus size={16} /> Add Member
                </button>
              )
            }
          />
        ) : viewMode === 'grid' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {filtered.map((member, idx) => (
              <MemberCard
                key={member._id}
                member={member}
                index={idx}
                onEdit={() => setModal({ mode: 'edit', member })}
                onDelete={() => setDeleteTarget(member)}
              />
            ))}
          </div>
        ) : (
          /* Table View */
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
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Member</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Designation</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr
                    key={m._id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={m.name} size="small" />
                        <span style={{ fontWeight: 600, color: '#F4F2EE' }}>{m.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#A5A5B0', fontSize: '0.8125rem' }}>
                      {m.role}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#6D6F7C', fontSize: '0.8125rem' }}>
                      {m.email}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#72C9A5',
                          background: 'rgba(114, 201, 165, 0.12)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 600,
                        }}
                      >
                        Active
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-icon btn-ghost btn-sm"
                          onClick={() => setModal({ mode: 'edit', member: m })}
                          title="Edit Member"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon btn-ghost btn-sm"
                          onClick={() => setDeleteTarget(m)}
                          title="Remove Member"
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
        <TeamModal
          mode={modal.mode}
          member={modal.member}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            fetchAll();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove Team Member"
          message={`Remove "${deleteTarget.name}" from workspace? Their assigned tasks will become unassigned.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

// ── Master Member Card ─────────────────────────────────────────────
function MemberCard({ member, onEdit, onDelete, index }) {
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
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={member.name} size="medium" />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F4F2EE', lineHeight: 1.3 }}>
                {member.name}
              </div>
              <div style={{ fontSize: '0.785rem', color: '#D8C7A3', fontWeight: 500, marginTop: 2 }}>
                {member.role}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            <button
              type="button"
              className="btn btn-icon btn-ghost btn-sm"
              onClick={onEdit}
              title="Edit Member"
            >
              <Edit2 size={14} />
            </button>
            <button
              type="button"
              className="btn btn-icon btn-ghost btn-sm"
              onClick={onDelete}
              title="Remove Member"
              style={{ color: '#E47C82' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Contact info badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.785rem',
            color: '#A5A5B0',
            background: '#101116',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: 16,
          }}
        >
          <Mail size={13} color="#9B8AFB" />
          <span className="truncate">{member.email}</span>
        </div>
      </div>

      {/* Card Footer: Project Count & Active State */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.785rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6D6F7C' }}>
          <FolderKanban size={13} />
          <span>{member.projects?.length || 0} Projects Assigned</span>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            color: '#72C9A5',
            background: 'rgba(114, 201, 165, 0.12)',
            padding: '2px 7px',
            borderRadius: 4,
            fontWeight: 600,
          }}
        >
          Active
        </span>
      </div>
    </motion.div>
  );
}

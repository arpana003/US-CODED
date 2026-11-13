import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare, Search, Calendar, MessageSquare, FileText, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeApi } from '../../services/api';
import Topbar from '../../components/layout/Topbar';
import sound from '../../utils/sound';

const STATUS_FILTERS = ['All', 'To Do', 'In Progress', 'Under Review', 'Completed', 'Blocked'];

export default function EmployeeMyTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await employeeApi.getMyTasks(params);
      if (res?.success) setTasks(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedStatus]);

  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.project?.name?.toLowerCase().includes(q) ||
      t.projectId?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <Topbar title="My Tasks" subtitle="Personal engineering work packages &amp; deliverables" />

      <div className="employee-page">
        {/* Header */}
        <motion.div
          className="employee-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="employee-title-group">
            <div className="employee-title-row">
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#F4F2EE', letterSpacing: '-0.02em', margin: 0 }}>
                My Assigned Tasks
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 9px',
                  borderRadius: 20,
                  background: 'rgba(155, 138, 251, 0.15)',
                  border: '1px solid rgba(155, 138, 251, 0.3)',
                  color: '#B5A5FF',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                <CheckSquare size={12} />
                {filteredTasks.length} Assigned
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#A5A5B0', marginTop: 4 }}>
              Track, inspect guidance, and advance progress across your assigned engineering work packages.
            </p>
          </div>
        </motion.div>

        {/* Filters and Search Bar */}
        <div
          style={{
            background: '#15161B',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#101116',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '9px',
              padding: '0 12px',
              height: 38,
              minWidth: 260,
              flex: 1,
              maxWidth: 420,
            }}
          >
            <Search size={14} color="#9B8AFB" />
            <input
              type="text"
              placeholder="Search by title, project, description…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Status Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedStatus(s);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: selectedStatus === s ? 'rgba(155, 138, 251, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                  background: selectedStatus === s ? 'rgba(155, 138, 251, 0.15)' : '#101116',
                  color: selectedStatus === s ? '#F4F2EE' : '#A5A5B0',
                  fontSize: '0.785rem',
                  fontWeight: selectedStatus === s ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6D6F7C' }}>
            Loading your tasks…
          </div>
        ) : filteredTasks.length === 0 ? (
          <div
            style={{
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <CheckSquare size={40} color="#6D6F7C" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: '1rem', color: '#F4F2EE', margin: 0 }}>No matching tasks found</h3>
            <p style={{ fontSize: '0.8125rem', color: '#A5A5B0', marginTop: 4 }}>
              Try adjusting your filter or search query.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
              gap: 20,
            }}
          >
            {filteredTasks.map((t, idx) => {
              const isOverdue =
                t.deadline &&
                new Date(t.deadline) < new Date() &&
                !['Completed', 'Done'].includes(t.status);

              return (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  whileHover={{ y: -4, transition: { duration: 0.15 } }}
                  onClick={() => {
                    sound.playClick();
                    navigate(`/employee/tasks/${t._id}`);
                  }}
                  style={{
                    background: '#15161B',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    padding: 22,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#78DCE8',
                          background: 'rgba(120, 220, 232, 0.1)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          textTransform: 'uppercase',
                        }}
                      >
                        {t.project?.name || t.projectId?.name || 'Project'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: t.priority === 'High' ? '#E7B86C' : '#9B8AFB',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '2px 7px',
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        {t.priority || 'Medium'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F4F2EE', lineHeight: 1.35, marginBottom: 6 }}>
                      {t.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: '#A5A5B0',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: 14,
                      }}
                    >
                      {t.description || 'No additional summary provided.'}
                    </p>
                  </div>

                  <div>
                    {t.instructions && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#D8C7A3',
                          fontSize: '0.75rem',
                          marginBottom: 12,
                          background: 'rgba(216, 199, 163, 0.1)',
                          padding: '5px 9px',
                          borderRadius: 6,
                        }}
                      >
                        <FileText size={12} />
                        <span>Admin guidance attached</span>
                      </div>
                    )}

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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: isOverdue ? '#E47C82' : '#6D6F7C' }}>
                        <Calendar size={13} color={isOverdue ? '#E47C82' : '#9B8AFB'} />
                        <span>{t.deadline ? new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No date'}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {t.comments?.length > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6D6F7C', fontSize: '0.75rem' }}>
                            <MessageSquare size={13} />
                            {t.comments.length}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 12,
                            background: t.status === 'Completed' || t.status === 'Done' ? 'rgba(114, 201, 165, 0.15)' : 'rgba(155, 138, 251, 0.15)',
                            color: t.status === 'Completed' || t.status === 'Done' ? '#72C9A5' : '#B5A5FF',
                          }}
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

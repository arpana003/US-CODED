import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ListOrdered, Search, Filter, CheckCircle2, Clock, ShieldAlert,
  ArrowRight, Sparkles, FolderKanban, User, RefreshCw
} from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import { Spinner, EmptyState } from '../../components/common/LoadingStates';
import Avatar from '../../components/common/Avatar';
import { aiApi } from '../../services/api';
import toast from 'react-hot-toast';

const clr = {
  bg: '#101116',
  surface: '#15161B',
  elevated: '#1B1D24',
  primary: '#9B8AFB',
  cyan: '#78DCE8',
  beige: '#D8C7A3',
  ivory: '#F3EFE7',
  success: '#72C9A5',
  warning: '#E7B86C',
  danger: '#E47C82',
  text: '#F4F2EE',
  muted: '#A5A5B0',
  border: 'rgba(255,255,255,0.09)'
};

const urgencyConfig = {
  Critical: { color: clr.danger, bg: 'rgba(228, 124, 130, 0.15)', border: 'rgba(228, 124, 130, 0.35)' },
  High: { color: clr.warning, bg: 'rgba(231, 184, 108, 0.15)', border: 'rgba(231, 184, 108, 0.35)' },
  Medium: { color: clr.primary, bg: 'rgba(155, 138, 251, 0.15)', border: 'rgba(155, 138, 251, 0.35)' },
  Low: { color: clr.success, bg: 'rgba(114, 201, 165, 0.15)', border: 'rgba(114, 201, 165, 0.35)' }
};

export default function AITaskPriority() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  const fetchPriorities = async () => {
    try {
      const res = await aiApi.getTaskPriority();
      if (res?.success) {
        setTasks(res.data || []);
      }
    } catch {
      toast.error('Failed to load prioritized tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPriorities();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await aiApi.triggerAnalysis();
      await fetchPriorities();
      toast.success('Task priority queue updated');
    } catch {
      toast.error('Failed to refresh tasks');
      setRefreshing(false);
    }
  };

  const filtered = tasks.filter(t => {
    const matchSearch =
      t.taskTitle?.toLowerCase().includes(search.toLowerCase()) ||
      t.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.reason?.toLowerCase().includes(search.toLowerCase());
    const matchUrgency = urgencyFilter === 'All' || t.urgencyLevel === urgencyFilter;
    return matchSearch && matchUrgency;
  });

  return (
    <div style={{ background: clr.bg, minHeight: '100vh', color: clr.text }}>
      <Topbar
        title="Intelligent Task Prioritization"
        subtitle="AI-calculated execution order balancing deadlines, dependencies, and project criticality"
      />

      <div style={{ padding: '24px 28px', maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Banner with AI rationale */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(155, 138, 251, 0.1) 0%, rgba(120, 220, 232, 0.05) 100%)',
          border: '1px solid rgba(155, 138, 251, 0.25)',
          borderRadius: 14,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(155, 138, 251, 0.2)', color: clr.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: clr.text }}>
                Dynamic Priority Scoring Engine
              </div>
              <div style={{ fontSize: '0.8125rem', color: clr.muted, marginTop: 2 }}>
                Tasks are evaluated continuously against critical path milestones, upcoming deadlines, and bottleneck prevention.
              </div>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(155, 138, 251, 0.15)',
              border: '1px solid rgba(155, 138, 251, 0.3)',
              borderRadius: 8,
              padding: '8px 16px',
              color: clr.primary,
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Recalculating...' : 'Recalculate Priorities'}</span>
          </button>
        </div>

        {/* Controls Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14, background: clr.surface,
          border: `1px solid ${clr.border}`, borderRadius: 14, padding: '14px 18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
            <Search size={16} color={clr.muted} />
            <input
              type="text"
              placeholder="Search by task title, project, assignee, or reasoning..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: clr.text,
                fontSize: '0.875rem',
                width: '100%'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(lvl => {
              const active = urgencyFilter === lvl;
              const cfg = urgencyConfig[lvl] || { color: clr.text, bg: 'rgba(255,255,255,0.08)' };
              return (
                <button
                  key={lvl}
                  onClick={() => setUrgencyFilter(lvl)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: active ? (lvl === 'All' ? 'rgba(255,255,255,0.15)' : cfg.bg) : 'transparent',
                    color: active ? (lvl === 'All' ? clr.text : cfg.color) : clr.muted,
                    border: active ? `1px solid ${lvl === 'All' ? 'rgba(255,255,255,0.2)' : cfg.color}` : `1px solid transparent`
                  }}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prioritized Task List */}
        {loading ? (
          <Spinner label="Evaluating priority matrix..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Tasks Found"
            description="All scheduled tasks are completed or filter returned no matches."
            icon={ListOrdered}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((item, idx) => {
              const cfg = urgencyConfig[item.urgencyLevel] || urgencyConfig.Medium;
              return (
                <motion.div
                  key={item.taskId || idx}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{
                    background: clr.surface,
                    border: `1px solid ${clr.border}`,
                    borderRadius: 14,
                    padding: '18px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Top Row: Rank, Urgency Score Bar & Level Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'rgba(255,255,255,0.06)',
                        color: clr.muted, fontSize: '0.8rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        #{idx + 1}
                      </span>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: cfg.bg,
                        color: cfg.color,
                        border: `1px solid ${cfg.border}`
                      }}>
                        {item.urgencyLevel} Urgency
                      </span>
                      {item.projectName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: clr.beige }}>
                          <FolderKanban size={14} />
                          <span>{item.projectName}</span>
                        </div>
                      )}
                    </div>

                    {/* Urgency Score bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                      <span style={{ fontSize: '0.72rem', color: clr.muted, fontWeight: 600 }}>Score:</span>
                      <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${item.urgencyScore || 0}%`,
                          height: '100%',
                          background: cfg.color,
                          borderRadius: 4
                        }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: cfg.color }}>
                        {item.urgencyScore || 0}
                      </span>
                    </div>
                  </div>

                  {/* Task Title */}
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: clr.text }}>
                    {item.taskTitle}
                  </div>

                  {/* Reason & Action Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {item.reason && (
                      <div style={{ background: clr.elevated, padding: '10px 14px', borderRadius: 8, border: `1px solid ${clr.border}` }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: clr.muted, textTransform: 'uppercase' }}>
                          Reason for Recommendation
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: clr.text, marginTop: 4 }}>
                          {item.reason}
                        </div>
                      </div>
                    )}
                    {item.suggestedAction && (
                      <div style={{ background: 'rgba(155, 138, 251, 0.08)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(155, 138, 251, 0.2)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: clr.primary, textTransform: 'uppercase' }}>
                          Suggested Action
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: clr.text, marginTop: 4 }}>
                          {item.suggestedAction}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer: Assignee & Expected Impact */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 10, paddingTop: 8, borderTop: `1px solid ${clr.border}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.assignedTo ? (
                        <>
                          <Avatar name={item.assignedTo.name} size="xs" />
                          <span style={{ fontSize: '0.8rem', color: clr.text }}>{item.assignedTo.name}</span>
                          <span style={{ fontSize: '0.75rem', color: clr.muted }}>• {item.assignedTo.role}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: clr.muted }}>Unassigned</span>
                      )}
                    </div>

                    {item.expectedImpact && (
                      <div style={{ fontSize: '0.75rem', color: clr.cyan, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 600 }}>Impact:</span>
                        <span>{item.expectedImpact}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw,
  Search, ShieldAlert, Sparkles, UserCheck, Flame
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

const statusConfig = {
  Critical: { color: clr.danger, bg: 'rgba(228, 124, 130, 0.15)', border: 'rgba(228, 124, 130, 0.35)', label: 'Burnout Risk' },
  Overloaded: { color: clr.warning, bg: 'rgba(231, 184, 108, 0.15)', border: 'rgba(231, 184, 108, 0.35)', label: 'Overloaded' },
  Balanced: { color: clr.success, bg: 'rgba(114, 201, 165, 0.15)', border: 'rgba(114, 201, 165, 0.35)', label: 'Optimal Load' },
  Underloaded: { color: clr.cyan, bg: 'rgba(120, 220, 232, 0.15)', border: 'rgba(120, 220, 232, 0.35)', label: 'Available Capacity' }
};

export default function AIWorkloadIntelligence() {
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchWorkload = async () => {
    try {
      const res = await aiApi.getWorkload();
      if (res?.success) {
        setWorkload(res.data || []);
      }
    } catch {
      toast.error('Failed to load workload analysis');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await aiApi.triggerAnalysis();
      await fetchWorkload();
      toast.success('Workload telemetry updated');
    } catch {
      toast.error('Failed to refresh workload');
      setRefreshing(false);
    }
  };

  // Metrics calculation
  const totalMembers = workload.length;
  const avgTasks = totalMembers > 0
    ? (workload.reduce((sum, m) => sum + (m.activeTasks || 0), 0) / totalMembers).toFixed(1)
    : 0;
  const overloadedCount = workload.filter(m => m.status === 'Overloaded' || m.status === 'Critical').length;
  const availableCount = workload.filter(m => m.status === 'Underloaded').length;

  const filtered = workload.filter(m =>
    m.memberName?.toLowerCase().includes(search.toLowerCase()) ||
    m.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: clr.bg, minHeight: '100vh', color: clr.text }}>
      <Topbar
        title="Team Workload Intelligence"
        subtitle="AI capacity modeling, burnout detection, and intelligent task redistribution suggestions"
      />

      <div style={{ padding: '24px 28px', maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Summary KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div style={{ background: clr.surface, border: `1px solid ${clr.border}`, borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: clr.muted, textTransform: 'uppercase' }}>
              Team Average Active
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: clr.beige, marginTop: 4 }}>
              {avgTasks} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: clr.muted }}>tasks / member</span>
            </div>
          </div>

          <div style={{ background: clr.surface, border: `1px solid ${clr.border}`, borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: clr.muted, textTransform: 'uppercase' }}>
              Workload Warnings
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: overloadedCount > 0 ? clr.warning : clr.success, marginTop: 4 }}>
              {overloadedCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: clr.muted }}>members overloaded</span>
            </div>
          </div>

          <div style={{ background: clr.surface, border: `1px solid ${clr.border}`, borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: clr.muted, textTransform: 'uppercase' }}>
              Available Bandwidth
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: clr.cyan, marginTop: 4 }}>
              {availableCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: clr.muted }}>members ready for tasks</span>
            </div>
          </div>

          <div style={{ background: clr.surface, border: `1px solid ${clr.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: clr.muted, textTransform: 'uppercase' }}>
                Total Active Roster
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: clr.primary, marginTop: 4 }}>
                {totalMembers}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(155, 138, 251, 0.15)',
                border: '1px solid rgba(155, 138, 251, 0.3)',
                color: clr.primary, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Refresh workload telemetry"
            >
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: clr.surface, border: `1px solid ${clr.border}`,
          borderRadius: 14, padding: '12px 18px'
        }}>
          <Search size={16} color={clr.muted} />
          <input
            type="text"
            placeholder="Search member by name or role..."
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

        {/* Member Grid */}
        {loading ? (
          <Spinner label="Evaluating team workload vectors..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Members Found"
            description="No team members match your search criteria."
            icon={Users}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
            {filtered.map((item, idx) => {
              const cfg = statusConfig[item.status] || statusConfig.Balanced;
              return (
                <motion.div
                  key={item.memberId || idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    background: clr.surface,
                    border: `1px solid ${clr.border}`,
                    borderTop: `4px solid ${cfg.color}`,
                    borderRadius: 14,
                    padding: '20px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
                  }}
                >
                  {/* Member Identity Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={item.memberName} size="md" />
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: clr.text }}>
                          {item.memberName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: clr.muted, marginTop: 2 }}>
                          {item.role}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.border}`
                    }}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Workload Meter */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6 }}>
                      <span style={{ color: clr.muted, fontWeight: 600 }}>Capacity Utilization</span>
                      <span style={{ color: cfg.color, fontWeight: 800 }}>{item.workloadScore || 0}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, item.workloadScore || 0)}%`,
                        height: '100%',
                        background: cfg.color,
                        borderRadius: 4
                      }} />
                    </div>
                  </div>

                  {/* Task Stat Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
                    <div style={{ background: clr.elevated, padding: '8px 10px', borderRadius: 8, border: `1px solid ${clr.border}` }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: clr.primary }}>
                        {item.activeTasks || 0}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: clr.muted, fontWeight: 600 }}>Active</div>
                    </div>
                    <div style={{ background: clr.elevated, padding: '8px 10px', borderRadius: 8, border: `1px solid ${clr.border}` }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: (item.overdueTasks || 0) > 0 ? clr.danger : clr.muted }}>
                        {item.overdueTasks || 0}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: clr.muted, fontWeight: 600 }}>Overdue</div>
                    </div>
                    <div style={{ background: clr.elevated, padding: '8px 10px', borderRadius: 8, border: `1px solid ${clr.border}` }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: clr.success }}>
                        {item.completedTasks || 0}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: clr.muted, fontWeight: 600 }}>Done</div>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  {item.recommendation && (
                    <div style={{
                      background: 'rgba(216, 199, 163, 0.08)',
                      border: '1px solid rgba(216, 199, 163, 0.2)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      fontSize: '0.8125rem',
                      color: clr.beige,
                      lineHeight: 1.4
                    }}>
                      <span style={{ fontWeight: 700, display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: 2 }}>
                        AI Guidance:
                      </span>
                      {item.recommendation}
                    </div>
                  )}
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


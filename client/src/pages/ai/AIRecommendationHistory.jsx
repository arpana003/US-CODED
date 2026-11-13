import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, CheckCircle, XCircle, Search, Filter, RefreshCw,
  FolderKanban, ArrowRight, Clock, ShieldCheck, Sparkles, AlertTriangle
} from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import { Spinner, EmptyState } from '../../components/common/LoadingStates';
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

const priorityColors = {
  Critical: clr.danger,
  High: clr.warning,
  Medium: clr.primary,
  Low: clr.muted
};

const statusColors = {
  New: clr.cyan,
  Accepted: clr.success,
  Dismissed: clr.muted,
  Applied: clr.primary,
  Expired: clr.danger
};

export default function AIRecommendationHistory() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');

  const fetchRecommendations = async () => {
    try {
      const res = await aiApi.getRecommendations({ live: 'true' });
      if (res?.success) {
        setRecommendations(res.data || []);
      }
    } catch {
      toast.error('Failed to load recommendation ledger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await aiApi.triggerAnalysis();
      await fetchRecommendations();
      toast.success('Recommendation registry updated');
    } catch {
      toast.error('Failed to update recommendations');
      setRefreshing(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await aiApi.acceptRecommendation(id);
      if (res?.success) {
        toast.success('Recommendation approved & accepted');
        setRecommendations(prev => prev.map(r => (r._id === id || r.id === id) ? { ...r, status: 'Accepted' } : r));
      }
    } catch {
      toast.error('Failed to accept recommendation');
    }
  };

  const handleDismiss = async (id) => {
    try {
      const res = await aiApi.dismissRecommendation(id);
      if (res?.success) {
        toast.success('Recommendation dismissed');
        setRecommendations(prev => prev.map(r => (r._id === id || r.id === id) ? { ...r, status: 'Dismissed' } : r));
      }
    } catch {
      toast.error('Failed to dismiss recommendation');
    }
  };

  const filtered = recommendations.filter(rec => {
    const matchSearch =
      rec.title?.toLowerCase().includes(search.toLowerCase()) ||
      rec.description?.toLowerCase().includes(search.toLowerCase()) ||
      rec.type?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusTab === 'All' || rec.status === statusTab;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ background: clr.bg, minHeight: '100vh', color: clr.text }}>
      <Topbar
        title="AI Recommendation Management"
        subtitle="Transparent decision ledger tracking proposed AI optimizations, approvals, and outcomes"
      />

      <div style={{ padding: '24px 28px', maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Filter Tabs & Search Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14, background: clr.surface,
          border: `1px solid ${clr.border}`, borderRadius: 14, padding: '14px 18px'
        }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {['All', 'New', 'Accepted', 'Dismissed', 'Applied'].map(tab => {
              const active = statusTab === tab;
              const color = statusColors[tab] || clr.primary;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusTab(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: active ? (tab === 'All' ? 'rgba(255,255,255,0.15)' : `${color}20`) : 'transparent',
                    color: active ? (tab === 'All' ? clr.text : color) : clr.muted,
                    border: active ? `1px solid ${tab === 'All' ? 'rgba(255,255,255,0.25)' : color}` : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: clr.elevated, border: `1px solid ${clr.border}`,
              borderRadius: 8, padding: '0 12px', height: 36
            }}>
              <Search size={14} color={clr.muted} />
              <input
                type="text"
                placeholder="Search recommendations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: clr.text,
                  fontSize: '0.8125rem',
                  width: 180
                }}
              />
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(155, 138, 251, 0.15)',
                border: '1px solid rgba(155, 138, 251, 0.3)',
                borderRadius: 8,
                padding: '6px 14px',
                color: clr.primary,
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Re-evaluate'}</span>
            </button>
          </div>
        </div>

        {/* Recommendations Ledger */}
        {loading ? (
          <Spinner label="Loading decision support ledger..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Recommendations in Registry"
            description={statusTab !== 'All' ? `No recommendations currently marked as ${statusTab}.` : "AI Engine has not detected required actions at this moment."}
            icon={BookOpen}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((rec, idx) => {
              const pColor = priorityColors[rec.priority] || clr.primary;
              const sColor = statusColors[rec.status] || clr.cyan;
              const recId = rec._id || rec.id;
              return (
                <motion.div
                  key={recId || idx}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{
                    background: clr.surface,
                    border: `1px solid ${clr.border}`,
                    borderRadius: 14,
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Top Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: `${sColor}20`,
                        color: sColor,
                        border: `1px solid ${sColor}40`
                      }}>
                        {rec.status || 'New'}
                      </span>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: `${pColor}15`,
                        color: pColor,
                        border: `1px solid ${pColor}30`
                      }}>
                        {rec.priority} Priority
                      </span>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: 'rgba(255,255,255,0.05)',
                        color: clr.muted
                      }}>
                        {rec.type?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: clr.muted }}>
                      Generated {new Date(rec.generatedAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: clr.text }}>
                      {rec.title}
                    </div>
                    {rec.description && (
                      <div style={{ fontSize: '0.85rem', color: clr.muted, marginTop: 4, lineHeight: 1.5 }}>
                        {rec.description}
                      </div>
                    )}
                  </div>

                  {/* Evidence & Expected Benefit Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {rec.evidence && (
                      <div style={{ background: clr.elevated, padding: '10px 14px', borderRadius: 8, border: `1px solid ${clr.border}` }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: clr.muted, textTransform: 'uppercase' }}>
                          Supporting Evidence
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: clr.text, marginTop: 4 }}>
                          {rec.evidence}
                        </div>
                      </div>
                    )}
                    {rec.expectedBenefit && (
                      <div style={{ background: 'rgba(114, 201, 165, 0.08)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(114, 201, 165, 0.2)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: clr.success, textTransform: 'uppercase' }}>
                          Projected Advantage
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: clr.text, marginTop: 4 }}>
                          {rec.expectedBenefit}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggested Action & Approval Actions */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 14, paddingTop: 10, borderTop: `1px solid ${clr.border}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: clr.primary, textTransform: 'uppercase' }}>
                        Proposed Action:
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: clr.text }}>
                        {rec.suggestedAction || 'Review project schedule and reallocate resources'}
                      </span>
                    </div>

                    {rec.status === 'New' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          onClick={() => handleAccept(recId)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'rgba(114, 201, 165, 0.15)',
                            border: '1px solid rgba(114, 201, 165, 0.35)',
                            borderRadius: 8,
                            padding: '6px 14px',
                            color: clr.success,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <CheckCircle size={14} />
                          <span>Approve & Accept</span>
                        </button>
                        <button
                          onClick={() => handleDismiss(recId)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'rgba(228, 124, 130, 0.12)',
                            border: '1px solid rgba(228, 124, 130, 0.3)',
                            borderRadius: 8,
                            padding: '6px 14px',
                            color: clr.danger,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <XCircle size={14} />
                          <span>Dismiss</span>
                        </button>
                      </div>
                    )}

                    {rec.status !== 'New' && rec.respondedBy && (
                      <span style={{ fontSize: '0.75rem', color: clr.muted }}>
                        Responded by <span style={{ color: clr.text, fontWeight: 600 }}>{rec.respondedBy}</span>
                      </span>
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


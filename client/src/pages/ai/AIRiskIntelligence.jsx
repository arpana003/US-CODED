import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Search, Filter, AlertTriangle, CheckCircle, Info, RefreshCw, FolderKanban
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

const severityConfig = {
  Critical: { color: clr.danger, bg: 'rgba(228, 124, 130, 0.12)', border: 'rgba(228, 124, 130, 0.3)' },
  High: { color: clr.warning, bg: 'rgba(231, 184, 108, 0.12)', border: 'rgba(231, 184, 108, 0.3)' },
  Medium: { color: clr.primary, bg: 'rgba(155, 138, 251, 0.12)', border: 'rgba(155, 138, 251, 0.3)' },
  Low: { color: clr.success, bg: 'rgba(114, 201, 165, 0.12)', border: 'rgba(114, 201, 165, 0.3)' }
};

export default function AIRiskIntelligence() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  const fetchRisks = async () => {
    try {
      const res = await aiApi.getRisks();
      if (res?.success) {
        setRisks(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load risk intelligence');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await aiApi.triggerAnalysis();
      await fetchRisks();
      toast.success('Risk models refreshed');
    } catch {
      toast.error('Failed to refresh risks');
      setRefreshing(false);
    }
  };

  // Severity counts
  const counts = {
    Total: risks.length,
    Critical: risks.filter(r => r.severity === 'Critical').length,
    High: risks.filter(r => r.severity === 'High').length,
    Medium: risks.filter(r => r.severity === 'Medium').length,
    Low: risks.filter(r => r.severity === 'Low').length,
  };

  const filtered = risks.filter(r => {
    const matchSearch =
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      r.type?.toLowerCase().includes(search.toLowerCase()) ||
      r.evidence?.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'All' || r.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div style={{ background: clr.bg, minHeight: '100vh', color: clr.text }}>
      <Topbar
        title="Risk Intelligence System"
        subtitle="AI-detected vulnerabilities, blockers, and project schedule threats"
      />

      <div style={{ padding: '24px 28px', maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Top Summary Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {['Total', 'Critical', 'High', 'Medium', 'Low'].map(sev => {
            const cfg = severityConfig[sev] || { color: clr.cyan, bg: 'rgba(120, 220, 232, 0.1)', border: clr.border };
            const isSelected = severityFilter === sev;
            return (
              <motion.div
                key={sev}
                whileHover={{ y: -2 }}
                onClick={() => setSeverityFilter(sev === 'Total' ? 'All' : sev)}
                style={{
                  background: isSelected ? cfg.bg : clr.surface,
                  border: `1px solid ${isSelected ? cfg.color : clr.border}`,
                  borderRadius: 14,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: isSelected ? `0 8px 24px ${cfg.color}20` : 'none'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: clr.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {sev === 'Total' ? 'Total Risks' : `${sev} Severity`}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: cfg.color, marginTop: 4 }}>
                    {counts[sev] || 0}
                  </div>
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: cfg.bg, color: cfg.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ShieldAlert size={18} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14, background: clr.surface,
          border: `1px solid ${clr.border}`, borderRadius: 14, padding: '14px 18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
            <Search size={16} color={clr.muted} />
            <input
              type="text"
              placeholder="Search risks by project, type, or description..."
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                background: clr.elevated,
                border: `1px solid ${clr.border}`,
                borderRadius: 8,
                padding: '6px 12px',
                color: clr.text,
                fontSize: '0.8125rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
              <option value="Medium">Medium Only</option>
              <option value="Low">Low Only</option>
            </select>

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
              <span>{refreshing ? 'Analyzing...' : 'Re-scan'}</span>
            </button>
          </div>
        </div>

        {/* Risk Cards */}
        {loading ? (
          <Spinner label="Running risk detection models..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Risk Factors Detected"
            description={search || severityFilter !== 'All' ? 'Try adjusting your filters' : 'All active projects are operating within safe operational parameters.'}
            icon={ShieldAlert}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((risk, idx) => {
              const cfg = severityConfig[risk.severity] || severityConfig.Medium;
              return (
                <motion.div
                  key={risk.riskId || idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    background: clr.surface,
                    border: `1px solid ${clr.border}`,
                    borderLeft: `5px solid ${cfg.color}`,
                    borderRadius: 14,
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                        {risk.severity} Severity
                      </span>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: 'rgba(255,255,255,0.05)',
                        color: clr.muted,
                        border: `1px solid ${clr.border}`
                      }}>
                        {risk.type?.replace(/_/g, ' ')}
                      </span>
                      {risk.projectName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: clr.beige }}>
                          <FolderKanban size={14} />
                          <span style={{ fontWeight: 600 }}>{risk.projectName}</span>
                        </div>
                      )}
                    </div>

                    <span style={{ fontSize: '0.75rem', color: clr.muted }}>
                      Detected {new Date(risk.detectedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Description */}
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: clr.text, lineHeight: 1.4 }}>
                    {risk.description}
                  </div>

                  {/* Supporting Evidence and Consequence */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                    {risk.evidence && (
                      <div style={{ background: clr.elevated, padding: '12px 14px', borderRadius: 10, border: `1px solid ${clr.border}` }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: clr.cyan, textTransform: 'uppercase', marginBottom: 4 }}>
                          Supporting Evidence
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: clr.text, lineHeight: 1.4 }}>
                          {risk.evidence}
                        </div>
                      </div>
                    )}
                    {risk.consequence && (
                      <div style={{ background: clr.elevated, padding: '12px 14px', borderRadius: 10, border: `1px solid ${clr.border}` }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: clr.danger, textTransform: 'uppercase', marginBottom: 4 }}>
                          Potential Consequence
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: clr.text, lineHeight: 1.4 }}>
                          {risk.consequence}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommended Action */}
                  {risk.recommendedAction && (
                    <div style={{
                      background: 'rgba(114, 201, 165, 0.08)',
                      border: '1px solid rgba(114, 201, 165, 0.25)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10
                    }}>
                      <CheckCircle size={18} color={clr.success} style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: clr.success, textTransform: 'uppercase' }}>
                          Recommended Preventive Action
                        </div>
                        <div style={{ fontSize: '0.85rem', color: clr.text, marginTop: 2 }}>
                          {risk.recommendedAction}
                        </div>
                      </div>
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


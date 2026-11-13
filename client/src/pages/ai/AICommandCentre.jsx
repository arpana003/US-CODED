import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, RefreshCw, Brain, TrendingUp, ShieldAlert, ListOrdered,
  Users, FlaskConical, MessageSquare, BookOpen, CheckCircle, XCircle,
  AlertTriangle, ChevronRight
} from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import { Spinner, EmptyState } from '../../components/common/LoadingStates';
import { aiApi } from '../../services/api';
import toast from 'react-hot-toast';

const clr = {
  bg: '#101116', surface: '#15161B', elevated: '#1B1D24',
  primary: '#9B8AFB', cyan: '#78DCE8', beige: '#D8C7A3',
  ivory: '#F3EFE7', success: '#72C9A5', warning: '#E7B86C',
  danger: '#E47C82', text: '#F4F2EE', muted: '#A5A5B0',
  border: 'rgba(255,255,255,0.09)'
};

const priorityColors = {
  Critical: clr.danger, High: clr.warning, Medium: clr.primary, Low: clr.muted
};

const severityBorderColor = {
  Critical: clr.danger, High: clr.warning, Medium: clr.primary, Low: clr.muted
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } })
};

const navCards = [
  { label: 'AI Command Centre', path: '/ai', icon: Brain, color: clr.primary, desc: 'Main AI hub & overview' },
  { label: 'Delay Predictions', path: '/ai/predictions', icon: TrendingUp, color: clr.cyan, desc: 'Project risk forecasts' },
  { label: 'Risk Intelligence', path: '/ai/risks', icon: ShieldAlert, color: clr.warning, desc: 'Detected risk factors' },
  { label: 'Task Priority', path: '/ai/tasks', icon: ListOrdered, color: clr.success, desc: 'AI-ranked task queue' },
  { label: 'Team Workload', path: '/ai/workload', icon: Users, color: clr.beige, desc: 'Workload analysis' },
  { label: 'What-If Simulation', path: '/ai/simulation', icon: FlaskConical, color: '#B5A5FF', desc: 'Scenario planning' },
  { label: 'AI Assistant', path: '/ai/assistant', icon: MessageSquare, color: clr.cyan, desc: 'Chat with AI' },
  { label: 'Recommendations', path: '/ai/recommendations', icon: BookOpen, color: clr.success, desc: 'All AI recommendations' },
];

export default function AICommandCentre() {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [risks, setRisks] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    try {
      const [bRes, aRes, pRes, rRes, wRes, recRes] = await Promise.allSettled([
        aiApi.getBriefing(),
        aiApi.analyze(),
        aiApi.getPredictions(),
        aiApi.getRisks(),
        aiApi.getWorkload(),
        aiApi.getRecommendations(),
      ]);
      if (bRes.status === 'fulfilled') setBriefing(bRes.value?.data || bRes.value);
      if (aRes.status === 'fulfilled') setAnalysis(aRes.value?.data || aRes.value);
      if (pRes.status === 'fulfilled') setPredictions(pRes.value?.data || []);
      if (rRes.status === 'fulfilled') setRisks(rRes.value?.data || []);
      if (wRes.status === 'fulfilled') setWorkload(wRes.value?.data || []);
      if (recRes.status === 'fulfilled') setRecommendations(recRes.value?.data || []);
    } catch (e) {
      toast.error('Failed to load AI data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await aiApi.triggerAnalysis();
      await fetchAll();
      toast.success('Analysis refreshed');
    } catch {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await aiApi.acceptRecommendation(id);
      setRecommendations(r => r.filter(x => x._id !== id && x.id !== id));
      toast.success('Recommendation accepted');
    } catch { toast.error('Failed to accept'); }
  };

  const handleDismiss = async (id) => {
    try {
      await aiApi.dismissRecommendation(id);
      setRecommendations(r => r.filter(x => x._id !== id && x.id !== id));
      toast.success('Recommendation dismissed');
    } catch { toast.error('Failed to dismiss'); }
  };

  const projectsAtRisk = predictions.filter(p => ['High', 'Critical'].includes(p.riskLevel)).length;
  const criticalAlerts = risks.filter(r => ['Critical', 'High'].includes(r.severity)).length;
  const overloaded = workload.filter(m => ['Overloaded', 'Critical'].includes(m.status)).length;
  const healthScore = analysis?.workspaceHealth?.score ?? analysis?.workspaceHealth ?? null;
  const topRecs = recommendations.slice(0, 5);
  const criticalRisks = risks.filter(r => ['Critical', 'High'].includes(r.severity)).slice(0, 4);

  if (loading) return (
    <div style={{ background: clr.bg, minHeight: '100vh' }}>
      <Topbar title="AI Command Centre" />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <Spinner text="Loading AI insights…" />
      </div>
    </div>
  );

  return (
    <div style={{ background: clr.bg, minHeight: '100vh', color: clr.text }}>
      <Topbar title="AI Command Centre" subtitle="Intelligent workspace insights" />
      <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Daily Briefing Banner */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={cardVariants}
          style={{
            background: clr.surface, borderRadius: 16, padding: '24px 28px',
            borderLeft: `4px solid ${clr.cyan}`, marginBottom: 28,
            border: `1px solid ${clr.border}`, borderLeftColor: clr.cyan, borderLeftWidth: 4
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Sparkles size={20} color={clr.cyan} />
              <span style={{ fontSize: '1rem', fontWeight: 700, color: clr.ivory }}>AI Daily Briefing</span>
            </div>
            <button onClick={handleRefresh} disabled={refreshing}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                borderRadius: 10, background: 'rgba(120,220,232,0.12)', border: `1px solid rgba(120,220,232,0.3)`,
                color: clr.cyan, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
              }}>
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing…' : '🔄 Refresh Analysis'}
            </button>
          </div>
          {briefing ? (
            <>
              <p style={{ color: clr.text, lineHeight: 1.75, margin: '8px 0 12px', fontSize: '0.9rem' }}>
                {briefing.briefing || 'No briefing available yet. Try refreshing.'}
              </p>
              {briefing.generatedAt && (
                <p style={{ color: clr.muted, fontSize: '0.75rem' }}>
                  Generated at {new Date(briefing.generatedAt).toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <p style={{ color: clr.muted, fontStyle: 'italic', fontSize: '0.875rem' }}>
              No briefing yet. Click "Refresh Analysis" to generate one.
            </p>
          )}
        </motion.div>

        {/* Workspace Health Overview */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={cardVariants}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: clr.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Workspace Health Overview
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              {
                label: 'Health Score', value: healthScore !== null ? `${healthScore}/100` : '—',
                color: healthScore >= 70 ? clr.success : healthScore >= 40 ? clr.warning : clr.danger,
                icon: Brain, desc: 'Overall workspace health'
              },
              { label: 'Projects at Risk', value: projectsAtRisk, color: clr.warning, icon: TrendingUp, desc: 'High or Critical risk level' },
              { label: 'Critical Alerts', value: criticalAlerts, color: clr.danger, icon: ShieldAlert, desc: 'High or Critical severity risks' },
              { label: 'Overloaded Members', value: overloaded, color: '#E47C82', icon: Users, desc: 'Overloaded or Critical workload' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial="hidden" animate="visible" custom={i + 2} variants={cardVariants}
                style={{
                  background: clr.elevated, borderRadius: 14, padding: '20px 22px',
                  border: `1px solid ${clr.border}`, position: 'relative', overflow: 'hidden'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon size={18} color={stat.color} />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: clr.muted, fontWeight: 500 }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: clr.muted }}>{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          {/* Priority Recommendations */}
          <motion.div initial="hidden" animate="visible" custom={6} variants={cardVariants}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: clr.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Priority Recommendations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topRecs.length === 0 ? (
                <EmptyState icon="✅" title="No recommendations" description="All clear — no active recommendations." />
              ) : topRecs.map((rec, i) => {
                const id = rec._id || rec.id;
                const pc = priorityColors[rec.priority] || clr.muted;
                return (
                  <motion.div key={id || i} initial="hidden" animate="visible" custom={i + 7} variants={cardVariants}
                    style={{ background: clr.elevated, borderRadius: 12, padding: '14px 16px', border: `1px solid ${clr.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, background: `${pc}25`, color: pc, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
                            {rec.priority || 'Medium'}
                          </span>
                          {rec.type && <span style={{ fontSize: '0.68rem', color: clr.muted, background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 20 }}>{rec.type}</span>}
                        </div>
                        <div style={{ fontSize: '0.845rem', fontWeight: 600, color: clr.text, marginBottom: 3 }}>{rec.title}</div>
                        <div style={{ fontSize: '0.78rem', color: clr.muted, lineHeight: 1.5 }}>{rec.description}</div>
                        {rec.evidence && (
                          <div style={{ marginTop: 6, fontSize: '0.72rem', color: clr.muted, fontStyle: 'italic' }}>
                            Evidence: {typeof rec.evidence === 'string' ? rec.evidence : JSON.stringify(rec.evidence).slice(0, 80)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={() => handleAccept(id)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'rgba(114,201,165,0.15)', border: '1px solid rgba(114,201,165,0.3)', color: clr.success, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                        <CheckCircle size={12} style={{ marginRight: 4 }} />✓ Accept
                      </button>
                      <button onClick={() => handleDismiss(id)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'rgba(228,124,130,0.1)', border: '1px solid rgba(228,124,130,0.25)', color: clr.danger, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                        <XCircle size={12} style={{ marginRight: 4 }} />✗ Dismiss
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Critical Alerts */}
          <motion.div initial="hidden" animate="visible" custom={7} variants={cardVariants}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: clr.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Critical Alerts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {criticalRisks.length === 0 ? (
                <EmptyState icon="🛡️" title="No critical alerts" description="No high or critical risks detected." />
              ) : criticalRisks.map((risk, i) => {
                const sc = severityBorderColor[risk.severity] || clr.muted;
                return (
                  <motion.div key={risk.riskId || i} initial="hidden" animate="visible" custom={i + 8} variants={cardVariants}
                    style={{
                      background: clr.elevated, borderRadius: 12, padding: '14px 16px',
                      border: `1px solid ${clr.border}`, borderLeft: `4px solid ${sc}`
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <AlertTriangle size={14} color={sc} />
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: sc, background: `${sc}22`, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
                        {risk.severity}
                      </span>
                      {risk.type && <span style={{ fontSize: '0.68rem', color: clr.muted, background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 20 }}>{risk.type}</span>}
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: clr.text, marginBottom: 3 }}>{risk.description}</div>
                    <div style={{ fontSize: '0.75rem', color: clr.muted, marginBottom: 6 }}>📁 {risk.projectName}</div>
                    {risk.evidence && <div style={{ fontSize: '0.72rem', color: clr.muted, marginBottom: 4 }}><strong>Evidence:</strong> {risk.evidence}</div>}
                    {risk.consequence && <div style={{ fontSize: '0.72rem', color: clr.muted, marginBottom: 6 }}><strong>Consequence:</strong> {risk.consequence}</div>}
                    {risk.recommendedAction && (
                      <div style={{ background: `${sc}18`, borderRadius: 8, padding: '8px 10px', fontSize: '0.72rem', color: clr.text, border: `1px solid ${sc}30` }}>
                        🎯 {risk.recommendedAction}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Quick Navigation */}
        <motion.div initial="hidden" animate="visible" custom={12} variants={cardVariants}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: clr.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            AI Intelligence Suite
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
            {navCards.map((card, i) => (
              <motion.button key={card.path} custom={i + 13} initial="hidden" animate="visible" variants={cardVariants}
                onClick={() => navigate(card.path)}
                style={{
                  background: clr.elevated, borderRadius: 14, padding: '18px 16px',
                  border: `1px solid ${clr.border}`, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: 8
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${card.color}50`; e.currentTarget.style.background = `${card.color}0A`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = clr.border; e.currentTarget.style.background = clr.elevated; }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${card.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <card.icon size={18} color={card.color} />
                </div>
                <div>
                  <div style={{ fontSize: '0.845rem', fontWeight: 600, color: clr.text, marginBottom: 2 }}>{card.label}</div>
                  <div style={{ fontSize: '0.72rem', color: clr.muted }}>{card.desc}</div>
                </div>
                <ChevronRight size={14} color={clr.muted} style={{ alignSelf: 'flex-end', marginTop: 'auto' }} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

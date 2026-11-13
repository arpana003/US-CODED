import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronDown, ChevronUp, Search, AlertTriangle } from 'lucide-react';
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

function getRiskColor(pct) {
  if (pct <= 30) return clr.success;
  if (pct <= 60) return clr.warning;
  if (pct <= 80) return clr.danger;
  return '#FF4D58';
}

function RiskCircle({ value, color, pulse }) {
  const r = 36, cx = 44, cy = 44, strokeW = 7;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
      {pulse && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `${color}20`, animation: 'riskPulse 1.5s infinite'
        }} />
      )}
      <svg width={88} height={88}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeW} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeW}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 800, color, lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: '0.56rem', color: clr.muted, fontWeight: 600 }}>risk</span>
      </div>
    </div>
  );
}

function PredictionCard({ pred, index }) {
  const [expanded, setExpanded] = useState(false);
  const rawRisk = pred.delayRisk || 0;
  const riskPct = rawRisk > 1 ? Math.round(rawRisk) : Math.round(rawRisk * 100);
  const color = getRiskColor(riskPct);
  const pulse = riskPct > 80;
  const riskBadgeColors = { Critical: clr.danger, High: clr.warning, Medium: clr.primary, Low: clr.success };
  const bc = riskBadgeColors[pred.riskLevel] || clr.muted;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      style={{ background: clr.elevated, borderRadius: 16, padding: '20px 22px', border: `1px solid ${clr.border}` }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <RiskCircle value={riskPct} color={color} pulse={pulse} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: clr.text, margin: 0 }}>{pred.projectName}</h3>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, background: `${bc}25`, color: bc, padding: '2px 9px', borderRadius: 20 }}>
              {pred.riskLevel}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginBottom: 10 }}>
            {pred.predictedCompletionDate && (
              <div>
                <div style={{ fontSize: '0.68rem', color: clr.muted, marginBottom: 2 }}>Predicted Completion</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: clr.text }}>{new Date(pred.predictedCompletionDate).toLocaleDateString()}</div>
              </div>
            )}
            {pred.predictedDelayDays > 0 && (
              <div>
                <div style={{ fontSize: '0.68rem', color: clr.muted, marginBottom: 2 }}>Estimated Delay</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: clr.danger }}>+{pred.predictedDelayDays} days</div>
              </div>
            )}
          </div>
          {pred.recommendation && (
            <div style={{ background: 'rgba(155,138,251,0.1)', border: '1px solid rgba(155,138,251,0.25)', borderRadius: 10, padding: '8px 12px', marginBottom: 10 }}>
              <div style={{ fontSize: '0.68rem', color: clr.primary, fontWeight: 700, marginBottom: 3 }}>AI Recommendation</div>
              <div style={{ fontSize: '0.78rem', color: clr.text, lineHeight: 1.5 }}>{pred.recommendation}</div>
            </div>
          )}
          {pred.mainFactors && pred.mainFactors.length > 0 && (
            <button onClick={() => setExpanded(e => !e)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: clr.muted, fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? 'Hide' : 'Show'} Main Factors ({pred.mainFactors.length})
            </button>
          )}
          <AnimatePresence>
            {expanded && pred.mainFactors && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden', marginTop: 8 }}>
                <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {pred.mainFactors.map((f, i) => (
                    <li key={i} style={{ fontSize: '0.78rem', color: clr.muted }}>{typeof f === 'string' ? f : f.factor || JSON.stringify(f)}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div style={{ marginTop: 12, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.68rem', color: clr.muted, textAlign: 'center' }}>
        ⚠️ Preliminary Model — Rule-based analysis. No historical ML training data.
      </div>
    </motion.div>
  );
}

export default function AIDelayPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    aiApi.getPredictions()
      .then(res => setPredictions(res?.data || []))
      .catch(() => toast.error('Failed to load predictions'))
      .finally(() => setLoading(false));
  }, []);

  const levels = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const filtered = predictions.filter(p => {
    const matchSearch = p.projectName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || p.riskLevel === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ background: clr.bg, minHeight: '100vh', color: clr.text }}>
      <Topbar title="Delay Predictions" subtitle="AI-powered project risk forecasting" />
      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: clr.surface, border: `1px solid ${clr.border}`, borderRadius: 10, padding: '0 12px' }}>
            <Search size={15} color={clr.muted} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…" style={{ flex: 1, background: 'none', border: 'none', color: clr.text, fontSize: '0.875rem', outline: 'none', padding: '10px 0' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {levels.map(l => {
              const colors = { Critical: clr.danger, High: clr.warning, Medium: clr.primary, Low: clr.success };
              const lc = colors[l] || clr.muted;
              return (
                <button key={l} onClick={() => setFilter(l)}
                  style={{ padding: '8px 14px', borderRadius: 10, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${filter === l ? lc : clr.border}`, background: filter === l ? `${lc}25` : 'transparent', color: filter === l ? lc : clr.muted }}>
                  {l}
                </button>
              );
            })}
          </div>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner text="Analyzing project delays…" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📈" title="No predictions found" description="No projects match the current filter." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
            {filtered.map((p, i) => <PredictionCard key={p.projectId || i} pred={p} index={i} />)}
          </div>
        )}
      </div>
      <style>{`@keyframes riskPulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.1;transform:scale(1.15)} }`}</style>
    </div>
  );
}

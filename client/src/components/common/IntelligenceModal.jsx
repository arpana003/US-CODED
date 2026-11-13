import React, { useState } from 'react';
import { Sparkles, Activity, AlertTriangle, TrendingUp, Cpu, X, Play, RefreshCw } from 'lucide-react';
import sound from '../../utils/sound';
import toast from 'react-hot-toast';

export default function IntelligenceModal({ isOpen, onClose, mode = 'predictions' }) {
  const [simulating, setSimulating] = useState(false);
  const [iteration, setIteration] = useState(1);

  if (!isOpen) return null;

  const runSimulation = () => {
    sound.playClick();
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setIteration((prev) => prev + 1);
      sound.playSuccess();
      toast.success('Simulation rerun: Digital twin telemetry synchronized.');
    }, 900);
  };

  const getTitle = () => {
    switch (mode) {
      case 'risk':
        return {
          title: 'Project Risk Analysis',
          subtitle: 'Predictive bottleneck identification & schedule variance diagnostics',
          icon: AlertTriangle,
          color: '#E7B86C',
        };
      case 'simulation':
        return {
          title: 'Future Scenario Simulation',
          subtitle: 'Monte Carlo schedule completion & workload capacity modeling',
          icon: Cpu,
          color: '#78DCE8',
        };
      case 'analytics':
        return {
          title: 'Digital Twin Deep Analytics',
          subtitle: 'Cycle time, throughput velocity, and resource utilization',
          icon: TrendingUp,
          color: '#72C9A5',
        };
      case 'predictions':
      default:
        return {
          title: 'AI Predictive Intelligence',
          subtitle: 'Neural deadline projections & delivery confidence scoring',
          icon: Sparkles,
          color: '#9B8AFB',
        };
    }
  };

  const info = getTitle();
  const Icon = info.icon;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 12, 18, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#15161B',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75), 0 0 32px rgba(155, 138, 251, 0.15)',
          overflow: 'hidden',
          animation: 'paletteEntrance 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(27, 29, 36, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `rgba(${info.color === '#78DCE8' ? '120, 220, 232' : '155, 138, 251'}, 0.2)`,
                color: info.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={19} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F4F2EE', margin: 0 }}>
                {info.title}
              </h3>
              <p style={{ fontSize: '0.785rem', color: '#A5A5B0', margin: 0 }}>
                {info.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#A5A5B0',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <div
              style={{
                background: '#101116',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: '#6D6F7C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Delivery Confidence
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#72C9A5', marginTop: 4 }}>
                89.4%
              </div>
              <span style={{ fontSize: '0.72rem', color: '#A5A5B0' }}>
                +3.2% vs baseline
              </span>
            </div>

            <div
              style={{
                background: '#101116',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: '#6D6F7C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Predicted Variance
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#E7B86C', marginTop: 4 }}>
                -2.4 Days
              </div>
              <span style={{ fontSize: '0.72rem', color: '#A5A5B0' }}>
                Minor buffer available
              </span>
            </div>

            <div
              style={{
                background: '#101116',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: '#6D6F7C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Simulated Runs
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#B5A5FF', marginTop: 4 }}>
                {iteration * 500}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#A5A5B0' }}>
                95% CI convergence
              </span>
            </div>
          </div>

          {/* Simulation Output Graph Representation */}
          <div
            style={{
              background: '#101116',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F4F2EE' }}>
                Live Digital Twin S-Curve Trajectory
              </span>
              <span style={{ fontSize: '0.72rem', color: '#D8C7A3', background: 'rgba(216, 199, 163, 0.1)', padding: '2px 8px', borderRadius: 6 }}>
                Active Model v2.4
              </span>
            </div>

            {/* S-Curve visual progress bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ color: '#A5A5B0' }}>Autonomous Drone Navigation System</span>
                  <span style={{ color: '#72C9A5', fontWeight: 600 }}>On Track (33% actual vs 30% plan)</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                  <div style={{ width: '33%', height: '100%', background: 'linear-gradient(90deg, #72C9A5, #78DCE8)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ color: '#A5A5B0' }}>Smart Energy Grid Hub</span>
                  <span style={{ color: '#E7B86C', fontWeight: 600 }}>Delayed by 3 days (Kafka lag)</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', background: 'linear-gradient(90deg, #E7B86C, #E47C82)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ color: '#A5A5B0' }}>E-Commerce Mobile Experience Redesign</span>
                  <span style={{ color: '#B5A5FF', fontWeight: 600 }}>Planning phase on schedule</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                  <div style={{ width: '25%', height: '100%', background: 'linear-gradient(90deg, #9B8AFB, #B5A5FF)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendation callout */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(155, 138, 251, 0.1), rgba(120, 220, 232, 0.05))',
              border: '1px solid rgba(155, 138, 251, 0.25)',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <Sparkles size={18} color="#9B8AFB" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.8125rem', color: '#E2E8F0', lineHeight: 1.5 }}>
              <strong>AI Recommendation:</strong> Reallocate David Chen from Drone TPU optimization to Grid Hub Kafka ingestion for 48 hours to eliminate the critical path schedule delay.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#101116',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#6D6F7C' }}>
            Powered by US-CODED Digital Twin Engine
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '7px 16px', fontSize: '0.8125rem' }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={runSimulation}
              disabled={simulating}
              className="btn btn-primary"
              style={{ padding: '7px 18px', fontSize: '0.8125rem' }}
            >
              {simulating ? (
                <>
                  <RefreshCw size={14} className="spin-animate" />
                  <span>Computing…</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Run New Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


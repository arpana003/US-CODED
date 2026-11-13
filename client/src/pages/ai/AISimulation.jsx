import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FlaskConical, Play, RotateCcw, AlertTriangle, ArrowRight,
  TrendingDown, TrendingUp, CheckCircle, Shield, FolderKanban, Users, Clock, Sparkles
} from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import { Spinner } from '../../components/common/LoadingStates';
import { aiApi, projectsApi } from '../../services/api';
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

const SCENARIOS = [
  { id: 'ADD_MEMBERS', name: 'Add Team Members', icon: Users, desc: 'Model the impact of increasing engineering headcount on project velocity.', paramName: 'Additional Members', defaultVal: 2, min: 1, max: 10 },
  { id: 'TASK_DELAY', name: 'Critical Task Slippage', icon: Clock, desc: 'Simulate cascading timeline impacts if a critical dependency slips by N days.', paramName: 'Slippage (Days)', defaultVal: 5, min: 1, max: 30 },
  { id: 'MEMBER_UNAVAILABLE', name: 'Member Off-Boarding', icon: AlertTriangle, desc: 'Analyze workload bottlenecks if a team member suddenly becomes unavailable.', paramName: 'Capacity Reduction (%)', defaultVal: 25, min: 10, max: 50 },
  { id: 'SPEED_INCREASE', name: 'Velocity Surge', icon: TrendingUp, desc: 'Simulate a 10-50% acceleration in task turnaround via AI tooling or focus sprints.', paramName: 'Velocity Boost (%)', defaultVal: 20, min: 10, max: 50 },
  { id: 'DEADLINE_EXTENSION', name: 'Milestone Buffer', icon: Shield, desc: 'Evaluate project health and risk reduction if the final deadline is pushed out.', paramName: 'Extension (Days)', defaultVal: 14, min: 1, max: 90 },
];

export default function AISimulation() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [paramValue, setParamValue] = useState(SCENARIOS[0].defaultVal);
  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(true);
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectsApi.getAll();
        if (res?.success && res.data?.length > 0) {
          setProjects(res.data);
          setSelectedProjectId(res.data[0]._id);
        }
      } catch {
        toast.error('Failed to load project list');
      } finally {
        setFetchingProjects(false);
      }
    };
    loadProjects();
  }, []);

  const handleScenarioChange = (scenario) => {
    setActiveScenario(scenario);
    setParamValue(scenario.defaultVal);
  };

  const handleRunSimulation = async () => {
    if (!selectedProjectId) {
      toast.error('Please select a project to simulate');
      return;
    }
    setLoading(true);
    try {
      const res = await aiApi.simulate({
        type: activeScenario.id,
        projectId: selectedProjectId,
        value: Number(paramValue)
      });
      if (res?.success) {
        setSimulationResult(res.data);
        toast.success('Simulation executed successfully');
      } else {
        toast.error(res?.message || 'Simulation failed');
      }
    } catch (err) {
      toast.error(err.message || 'Simulation computation error');
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  return (
    <div style={{ background: clr.bg, minHeight: '100vh', color: clr.text }}>
      <Topbar
        title="What-If AI Future Simulation"
        subtitle="Monte Carlo scenario sandbox modeling resource shifts, delays, and velocity changes"
      />

      <div style={{ padding: '24px 28px', maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Banner with Safety Note */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(120, 220, 232, 0.08) 0%, rgba(155, 138, 251, 0.08) 100%)',
          border: '1px solid rgba(120, 220, 232, 0.25)',
          borderRadius: 14,
          padding: '16px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <FlaskConical size={24} color={clr.cyan} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', color: clr.text, lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700, color: clr.cyan }}>Digital Twin Sandbox Mode: </span>
            What-If simulations test theoretical operational vectors against real project data without persisting or mutating actual database records.
          </div>
        </div>

        {/* Main Grid: Config (Left) & Results (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: 24, alignItems: 'start' }}>
          
          {/* Left Panel: Configuration */}
          <div style={{
            background: clr.surface,
            border: `1px solid ${clr.border}`,
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: clr.text }}>
              Simulation Parameters
            </div>

            {/* Target Project Dropdown */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: clr.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Target Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 12px',
                  background: clr.elevated,
                  border: `1px solid ${clr.border}`,
                  borderRadius: 10,
                  color: clr.text,
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {projects.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.progress}% done)
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario Selector */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: clr.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Select Scenario
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SCENARIOS.map(sc => {
                  const isSelected = activeScenario.id === sc.id;
                  const Icon = sc.icon;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => handleScenarioChange(sc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: isSelected ? '1px solid rgba(155, 138, 251, 0.4)' : `1px solid ${clr.border}`,
                        background: isSelected ? 'rgba(155, 138, 251, 0.12)' : clr.elevated,
                        color: isSelected ? clr.text : clr.muted,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={18} color={isSelected ? clr.primary : clr.muted} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? clr.text : clr.muted }}>
                          {sc.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: clr.muted, marginTop: 2 }}>
                          {sc.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Value Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: clr.muted, textTransform: 'uppercase' }}>
                  {activeScenario.paramName}
                </label>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: clr.primary }}>
                  {paramValue}
                </span>
              </div>
              <input
                type="range"
                min={activeScenario.min}
                max={activeScenario.max}
                value={paramValue}
                onChange={(e) => setParamValue(Number(e.target.value))}
                style={{ width: '100%', accentColor: clr.primary, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: clr.muted, marginTop: 4 }}>
                <span>{activeScenario.min}</span>
                <span>{activeScenario.max}</span>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunSimulation}
              disabled={loading || !selectedProjectId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, #9B8AFB 0%, #B5A5FF 100%)',
                color: '#101116',
                border: 'none',
                borderRadius: 10,
                padding: '14px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: 6
              }}
            >
              <Play size={16} fill="#101116" />
              <span>{loading ? 'Simulating Dynamic Vectors...' : 'Execute What-If Model'}</span>
            </button>
          </div>

          {/* Right Panel: Output & Results */}
          <div style={{
            background: clr.surface,
            border: `1px solid ${clr.border}`,
            borderRadius: 16,
            padding: 24,
            minHeight: 520,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {!simulationResult && !loading && (
              <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 360, padding: 30 }}>
                <FlaskConical size={48} color={clr.primary} style={{ opacity: 0.5, marginBottom: 14 }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: clr.text }}>
                  Ready to Simulate
                </div>
                <div style={{ fontSize: '0.85rem', color: clr.muted, marginTop: 6, lineHeight: 1.5 }}>
                  Select a project and scenario on the left, then click <strong>"Execute What-If Model"</strong> to compare current trajectory against simulated forecasts.
                </div>
              </div>
            )}

            {loading && (
              <div style={{ margin: 'auto' }}>
                <Spinner label="Executing Monte Carlo simulation and trajectory calculations..." />
              </div>
            )}

            {simulationResult && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                {/* Result Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${clr.border}`, paddingBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: clr.text }}>
                      {simulationResult.scenarioName}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: clr.muted, marginTop: 2 }}>
                      {simulationResult.description}
                    </div>
                  </div>

                  {/* Impact Badge */}
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: simulationResult.impact === 'Positive' ? 'rgba(114, 201, 165, 0.15)' :
                                simulationResult.impact === 'Negative' ? 'rgba(228, 124, 130, 0.15)' : 'rgba(255,255,255,0.08)',
                    color: simulationResult.impact === 'Positive' ? clr.success :
                           simulationResult.impact === 'Negative' ? clr.danger : clr.muted,
                    border: `1px solid ${simulationResult.impact === 'Positive' ? 'rgba(114, 201, 165, 0.3)' :
                                        simulationResult.impact === 'Negative' ? 'rgba(228, 124, 130, 0.3)' : clr.border}`
                  }}>
                    {simulationResult.impact} Impact
                  </span>
                </div>

                {/* Side-by-Side Trajectory Comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  
                  {/* Current State */}
                  <div style={{
                    background: clr.elevated,
                    border: `1px solid ${clr.border}`,
                    borderRadius: 14,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: clr.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Baseline Trajectory
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: clr.muted }}>Estimated Completion</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: clr.text }}>
                          {simulationResult.current?.completionDate
                            ? new Date(simulationResult.current.completionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'On Track'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: clr.muted }}>Delay Risk Index</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: clr.warning }}>
                          {simulationResult.current?.delayRisk || 0}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: clr.muted }}>Health Diagnosis</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: clr.beige }}>
                          {simulationResult.current?.healthStatus || 'Active'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Simulated State */}
                  <div style={{
                    background: 'rgba(155, 138, 251, 0.06)',
                    border: '1px solid rgba(155, 138, 251, 0.3)',
                    borderRadius: 14,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: clr.primary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Simulated Forecast
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: clr.muted }}>Predicted Completion</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: clr.cyan }}>
                          {simulationResult.simulated?.completionDate
                            ? new Date(simulationResult.simulated.completionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'Estimated'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: clr.muted }}>Simulated Risk Index</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: simulationResult.simulated?.delayRisk < simulationResult.current?.delayRisk ? clr.success : clr.danger }}>
                          {simulationResult.simulated?.delayRisk || 0}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: clr.muted }}>Projected Health</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: clr.text }}>
                          {simulationResult.simulated?.healthStatus || 'Optimized'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Explanation */}
                <div style={{
                  background: 'rgba(216, 199, 163, 0.08)',
                  border: '1px solid rgba(216, 199, 163, 0.25)',
                  borderRadius: 12,
                  padding: 18
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 700, color: clr.beige, textTransform: 'uppercase' }}>
                    <Sparkles size={16} />
                    <span>AI Synthetic Assessment</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: clr.text, marginTop: 6, lineHeight: 1.5 }}>
                    {simulationResult.aiExplanation}
                  </div>
                </div>

                {/* Disclaimer */}
                <div style={{ fontSize: '0.75rem', color: clr.muted, textAlign: 'center', borderTop: `1px solid ${clr.border}`, paddingTop: 14 }}>
                  ⚠️ {simulationResult.disclaimer || 'This is a simulation only. No actual project data has been modified.'}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { employeeApi } from '../../services/api';
import Topbar from '../../components/layout/Topbar';
import { Spinner, EmptyState } from '../../components/common/LoadingStates';
import toast from 'react-hot-toast';

export default function EmployeeProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      try {
        const res = await employeeApi.getDashboard();
        if (mounted && res?.success) {
          setProjects(res.data.myProjects || []);
        }
      } catch {
        if (mounted) toast.error('Failed to load assigned projects');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProjects();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <Topbar title="My Projects" subtitle="Authorized project workspaces and delivery streams" />

      <div className="page-container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="page-title">
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F4F2EE', letterSpacing: '-0.02em', margin: 0 }}>
              My Authorized Projects
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#A5A5B0', marginTop: 4 }}>
              Active engineering projects where tasks are assigned to your profile.
            </p>
          </div>
        </motion.div>

        {loading ? (
          <Spinner text="Loading your project workspaces…" />
        ) : projects.length === 0 ? (
          <EmptyState
            icon="📁"
            title="No project assignments yet"
            description="You will see project telemetry here once your lead assigns you to an active work package."
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '20px',
            }}
          >
            {projects.map((p, idx) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                style={{
                  background: '#15161B',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#78DCE8',
                        background: 'rgba(120, 220, 232, 0.12)',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {p.status || 'Active'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6D6F7C' }}>
                      Authorized Access
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F4F2EE', marginBottom: 12 }}>
                    {p.name}
                  </h3>

                  {/* Progress */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6 }}>
                      <span style={{ color: '#A5A5B0' }}>Project Progress</span>
                      <strong style={{ color: '#F4F2EE' }}>{p.progress || 0}%</strong>
                    </div>
                    <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${p.progress || 0}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #9B8AFB, #78DCE8)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.785rem',
                    color: '#6D6F7C',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} color="#9B8AFB" />
                    <span>{p.deadline ? new Date(p.deadline).toLocaleDateString() : 'Active timeline'}</span>
                  </div>
                  <span style={{ color: '#72C9A5', fontWeight: 600 }}>Linked Member</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

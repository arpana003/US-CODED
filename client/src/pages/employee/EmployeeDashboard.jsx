import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare, CheckCircle2, Clock, AlertTriangle, ArrowRight, Calendar,
  Flame, ChevronRight, FolderKanban, Sparkles, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { employeeApi } from '../../services/api';
import Topbar from '../../components/layout/Topbar';
import sound from '../../utils/sound';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const res = await employeeApi.getDashboard();
        if (mounted && res?.success) {
          setDashboardData(res.data);
        }
      } catch (err) {
        if (mounted) {
          toast.error(err.message || 'Failed to load dashboard data');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => { mounted = false; };
  }, []);

  const stats = dashboardData?.stats || {
    total: dashboardData?.totalAssigned || 0,
    completed: dashboardData?.completed || 0,
    inProgress: dashboardData?.inProgress || 0,
    overdue: dashboardData?.overdue || 0,
    pending: dashboardData?.pending || 0,
  };
  const recentTasks = dashboardData?.recentTasks || [];

  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase().replace(/\s+/g, '-');
    return `badge-status ${s}`;
  };

  const getPriorityClass = (priority) => {
    const p = (priority || '').toLowerCase();
    return `badge-priority ${p}`;
  };

  return (
    <div>
      <Topbar title="Personal Workspace" subtitle="Authenticated specialist telemetry" />

      <div className="employee-page">
        {/* Welcome Section */}
        <motion.div
          className="employee-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="employee-header-left">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(155, 138, 251, 0.25), rgba(120, 220, 232, 0.2))',
                border: '1px solid rgba(155, 138, 251, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#78DCE8',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase() || 'E'}</span>
              )}
            </div>
            <div className="employee-title-group">
              <div className="employee-title-row">
                <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#F4F2EE', letterSpacing: '-0.02em', margin: 0 }}>
                  Welcome back, {user?.name || 'Specialist'}
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 9px',
                    borderRadius: 20,
                    background: 'rgba(120, 220, 232, 0.12)',
                    border: '1px solid rgba(120, 220, 232, 0.3)',
                    color: '#78DCE8',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  <Sparkles size={11} />
                  {user?.designation || 'Engineering Specialist'}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#A5A5B0', marginTop: 4 }}>
                Here&apos;s your personal workspace and today&apos;s priorities.
              </p>
            </div>
          </div>

          <div className="employee-header-actions">
            <Link
              to="/employee/tasks"
              className="btn btn-primary"
              onClick={() => sound.playClick()}
              style={{ padding: '9px 20px', textDecoration: 'none', fontSize: '0.85rem' }}
            >
              <span>View All My Tasks</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>

        {/* 4 Overview KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
          }}
          className="employee-stats-grid"
        >
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            style={{
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: 22,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A5A5B0', textTransform: 'uppercase' }}>
                My Assigned Tasks
              </span>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(120, 220, 232, 0.15)',
                  color: '#78DCE8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckSquare size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F4F2EE', lineHeight: 1, marginBottom: 6 }}>
              {loading ? '…' : stats.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6D6F7C' }}>
              Allocated across authorized projects
            </div>
          </motion.div>

          <motion.div
            className="card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            style={{
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: 22,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A5A5B0', textTransform: 'uppercase' }}>
                Completed Tasks
              </span>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(114, 201, 165, 0.15)',
                  color: '#72C9A5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F4F2EE', lineHeight: 1, marginBottom: 6 }}>
              {loading ? '…' : stats.completed}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6D6F7C' }}>
              Successfully delivered &amp; verified
            </div>
          </motion.div>

          <motion.div
            className="card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            style={{
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: 22,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A5A5B0', textTransform: 'uppercase' }}>
                Pending Tasks
              </span>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(155, 138, 251, 0.15)',
                  color: '#B5A5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F4F2EE', lineHeight: 1, marginBottom: 6 }}>
              {loading ? '…' : stats.pending}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6D6F7C' }}>
              Currently in progress or queued
            </div>
          </motion.div>

          <motion.div
            className="card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            style={{
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: 22,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A5A5B0', textTransform: 'uppercase' }}>
                Overdue Tasks
              </span>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(231, 184, 108, 0.15)',
                  color: '#E7B86C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stats.overdue > 0 ? '#E47C82' : '#F4F2EE', lineHeight: 1, marginBottom: 6 }}>
              {loading ? '…' : stats.overdue}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6D6F7C' }}>
              Past deadline or at risk
            </div>
          </motion.div>
        </div>

        {/* Recently Assigned Tasks Section */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          style={{
            background: '#15161B',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F4F2EE', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckSquare size={18} color="#9B8AFB" />
                Recently Assigned Tasks
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#A5A5B0', margin: '3px 0 0' }}>
                Your personal work packages requiring status advancement
              </p>
            </div>
            <Link
              to="/employee/tasks"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#9B8AFB',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>View Full Task Board</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#6D6F7C' }}>
              Loading task roster…
            </div>
          ) : recentTasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6D6F7C' }}>
              <CheckCircle2 size={36} color="#72C9A5" style={{ marginBottom: 10 }} />
              <h3 style={{ fontSize: '1rem', color: '#F4F2EE', margin: 0 }}>All Caught Up!</h3>
              <p style={{ fontSize: '0.8125rem', marginTop: 4 }}>You currently have no tasks assigned to your queue.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '12px 14px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Task Title</th>
                    <th style={{ padding: '12px 14px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Project</th>
                    <th style={{ padding: '12px 14px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Priority</th>
                    <th style={{ padding: '12px 14px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 14px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase' }}>Deadline</th>
                    <th style={{ padding: '12px 14px', color: '#6D6F7C', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((t) => (
                    <tr
                      key={t._id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td style={{ padding: '14px' }}>
                        <Link
                          to={`/employee/tasks/${t._id}`}
                          style={{ color: '#F4F2EE', fontWeight: 600, textDecoration: 'none' }}
                        >
                          {t.title}
                        </Link>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#78DCE8', background: 'rgba(120, 220, 232, 0.1)', padding: '2px 7px', borderRadius: 4 }}>
                          {t.project?.name || t.projectId?.name || 'Project'}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: t.priority === 'High' ? '#E7B86C' : '#9B8AFB',
                            fontWeight: 600,
                          }}
                        >
                          {t.priority || 'Medium'}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={getStatusClass(t.status)}>{t.status}</span>
                      </td>
                      <td style={{ padding: '14px', fontSize: '0.8125rem', color: '#A5A5B0' }}>
                        {t.deadline ? new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <Link
                          to={`/employee/tasks/${t._id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

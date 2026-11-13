import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { employeeApi } from '../../services/api';
import Topbar from '../../components/layout/Topbar';
import { Spinner, EmptyState } from '../../components/common/LoadingStates';
import toast from 'react-hot-toast';

export default function EmployeeActivity() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchActivities = async () => {
      try {
        const res = await employeeApi.getMyTasks();
        if (mounted && res?.success) {
          setTasks(res.data || []);
        }
      } catch {
        if (mounted) toast.error('Failed to load activity trail');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchActivities();
    return () => { mounted = false; };
  }, []);

  // Aggregate all activityLog entries across tasks
  const activities = [];
  tasks.forEach((t) => {
    if (t.activityLog && t.activityLog.length > 0) {
      t.activityLog.forEach((a) => {
        activities.push({
          taskId: t._id,
          taskTitle: t.title,
          projectName: t.project?.name || 'Project',
          action: a.action,
          by: a.by || 'System',
          at: a.at ? new Date(a.at) : new Date(),
        });
      });
    }
  });

  // Sort descending by time
  activities.sort((a, b) => b.at - a.at);

  return (
    <div>
      <Topbar title="My Activity" subtitle="Historical audit log of your task progressions and updates" />

      <div className="page-container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="page-title">
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F4F2EE', letterSpacing: '-0.02em', margin: 0 }}>
              Personal Activity Stream
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#A5A5B0', marginTop: 4 }}>
              Chronological audit trail of all task status modifications, comments, and milestones.
            </p>
          </div>
        </motion.div>

        {loading ? (
          <Spinner text="Compiling activity history…" />
        ) : activities.length === 0 ? (
          <EmptyState
            icon="📈"
            title="No activity logged yet"
            description="As you advance task statuses or add comments, your timeline will update in real time."
          />
        ) : (
          <div
            style={{
              background: '#15161B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '860px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activities.map((act, index) => (
                <motion.div
                  key={`${act.taskId}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    paddingBottom: 20,
                    borderBottom: index < activities.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  }}
                >
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
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Activity size={17} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F4F2EE' }}>
                        {act.action}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#6D6F7C' }}>
                        {act.at.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#A5A5B0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Task:</span>
                      <strong style={{ color: '#D8C7A3' }}>{act.taskTitle}</strong>
                      <span>·</span>
                      <span style={{ color: '#78DCE8' }}>{act.projectName}</span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#6D6F7C', marginTop: 4 }}>
                      Executed by <span style={{ color: '#F4F2EE' }}>{act.by}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

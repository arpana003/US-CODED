import React, { useState } from 'react';
import { Bell, CheckCheck, Clock, AlertTriangle, Sparkles, X, Check } from 'lucide-react';
import sound from '../../utils/sound';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Autonomous Drone Flight Telemetry',
    message: 'Sensor fusion ROS2 driver integration is pending review.',
    category: 'Task',
    time: '12m ago',
    unread: true,
    urgent: false,
  },
  {
    id: 'n2',
    title: 'Smart Energy Grid Hub Alert',
    message: 'Kafka consumer lag exceeds threshold on telemetry stream.',
    category: 'Urgent',
    time: '45m ago',
    unread: true,
    urgent: true,
  },
  {
    id: 'n3',
    title: 'Digital Twin Model Recalibrated',
    message: 'Automated predictive simulation updated completion probability to 88%.',
    category: 'System',
    time: '2h ago',
    unread: false,
    urgent: false,
  },
  {
    id: 'n4',
    title: 'Team Workload Distribution',
    message: 'Priya Sharma marked checkout UX wireframes as Completed.',
    category: 'Team',
    time: '4h ago',
    unread: false,
    urgent: false,
  },
];

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    sound.playSuccess();
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id) => {
    sound.playClick();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: '24px',
        marginTop: '8px',
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        background: '#15161B',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65), 0 0 20px rgba(155, 138, 251, 0.1)',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'drawerSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(27, 29, 36, 0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={16} color="#9B8AFB" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F4F2EE' }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '0.7rem',
                background: 'rgba(155, 138, 251, 0.25)',
                color: '#B5A5FF',
                padding: '2px 7px',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              title="Mark all as read"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#D8C7A3',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
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
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: '#6D6F7C', fontSize: '0.85rem' }}>
            No notifications right now.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                background: item.unread ? 'rgba(155, 138, 251, 0.04)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  marginTop: '6px',
                  background: item.unread
                    ? item.urgent
                      ? '#E47C82'
                      : '#9B8AFB'
                    : 'transparent',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: item.unread ? 700 : 600,
                      color: item.unread ? '#F4F2EE' : '#A5A5B0',
                    }}
                  >
                    {item.title}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#6D6F7C' }}>
                    {item.time}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.785rem',
                    color: '#A5A5B0',
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  {item.message}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: item.urgent
                        ? 'rgba(228, 124, 130, 0.18)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: item.urgent ? '#E47C82' : '#D8C7A3',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes drawerSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}


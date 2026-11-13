import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Search, Bell, Volume2, VolumeX, ChevronRight, LogOut, Settings, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import sound from '../../utils/sound';
import CommandPalette from '../common/CommandPalette';
import NotificationDrawer from '../common/NotificationDrawer';
import SettingsModal from '../common/SettingsModal';

export default function Topbar({ title, subtitle }) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());

  const profileRef = useRef(null);

  // Update clock every second
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSound = () => {
    const updated = sound.toggle();
    setSoundEnabled(updated);
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    if (path.startsWith('/projects/')) return 'Projects / Details';
    if (path === '/projects') return 'Projects';
    if (path === '/team') return 'Team Management';
    if (path === '/tasks') return 'Tasks';
    if (path === '/employee/dashboard') return 'Employee / Dashboard';
    if (path === '/employee/tasks') return 'Employee / My Tasks';
    if (path.startsWith('/employee/tasks/')) return 'Employee / Task Details';
    if (path === '/employee/profile') return 'Employee / My Profile';
    return title || 'Workspace';
  };

  return (
    <>
      <header
        style={{
          height: '64px',
          background: 'rgba(21, 22, 27, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left: Breadcrumbs & Page Heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#6D6F7C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>US-CODED</span>
              <ChevronRight size={11} color="#6D6F7C" />
              <span style={{ color: '#D8C7A3', fontWeight: 600 }}>{getBreadcrumb()}</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F4F2EE', letterSpacing: '-0.01em' }}>
              {title || 'Workspace'}
            </div>
          </div>
        </div>

        {/* Center: Command Palette Trigger Button */}
        <div style={{ flex: 1, maxWidth: '380px', margin: '0 24px' }}>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 12px',
              borderRadius: '9px',
              background: '#101116',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#6D6F7C',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(155, 138, 251, 0.3)';
              e.currentTarget.style.color = '#A5A5B0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#6D6F7C';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} color="#9B8AFB" />
              <span>Quick search projects, tasks, team…</span>
            </div>
            <kbd
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#D8C7A3',
                fontSize: '0.675rem',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Clock, Notifications, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Live Socket Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.75rem',
              color: connected ? '#72C9A5' : '#E7B86C',
              background: connected ? 'rgba(114, 201, 165, 0.1)' : 'rgba(231, 184, 108, 0.1)',
              border: `1px solid ${connected ? 'rgba(114, 201, 165, 0.25)' : 'rgba(231, 184, 108, 0.25)'}`,
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: connected ? '#72C9A5' : '#E7B86C',
                animation: connected ? 'pulseDot 2s infinite' : 'none',
              }}
            />
            <span>{connected ? 'Live Sync' : 'Connecting'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={soundEnabled ? 'Mute audio feedback' : 'Enable audio feedback'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: soundEnabled ? '#9B8AFB' : '#6D6F7C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Notifications Button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setIsNotificationsOpen((prev) => !prev);
              }}
              title="Notifications"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: isNotificationsOpen ? 'rgba(155, 138, 251, 0.15)' : 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: isNotificationsOpen ? '#B5A5FF' : '#A5A5B0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
            >
              <Bell size={16} />
              <span
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 7,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#9B8AFB',
                }}
              />
            </button>

            {/* Notification Drawer Dropdown */}
            <NotificationDrawer
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          {/* Clock */}
          <div
            style={{
              fontSize: '0.785rem',
              color: '#A5A5B0',
              fontVariantNumeric: 'tabular-nums',
              fontFamily: 'var(--font-mono)',
              padding: '0 6px',
            }}
          >
            {format(time, 'HH:mm:ss')}
          </div>

          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setIsProfileOpen((prev) => !prev);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(155, 138, 251, 0.3), rgba(120, 220, 232, 0.2))',
                  border: '1px solid rgba(155, 138, 251, 0.35)',
                  color: '#78DCE8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  width: '230px',
                  background: '#15161B',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
                  padding: '8px',
                  zIndex: 1000,
                  animation: 'drawerSlide 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F4F2EE' }}>
                    {user?.name || 'Authorized User'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6D6F7C', margin: '2px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email}
                  </div>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: user?.role === 'admin' ? '#D8C7A3' : '#78DCE8',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 7px',
                      borderRadius: 4,
                    }}
                  >
                    {user?.role === 'admin' ? 'Lead Administrator' : (user?.designation || 'Team Member')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 0' }}>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsProfileOpen(false);
                      navigate(user?.role === 'admin' ? '/team' : '/employee/profile');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: 'transparent',
                      border: 'none',
                      color: '#A5A5B0',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#F4F2EE';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#A5A5B0';
                    }}
                  >
                    <User size={14} color="#9B8AFB" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsProfileOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: 'transparent',
                      border: 'none',
                      color: '#A5A5B0',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#F4F2EE';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#A5A5B0';
                    }}
                  >
                    <Settings size={14} color="#D8C7A3" />
                    <span>Preferences</span>
                  </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      logout();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: 'transparent',
                      border: 'none',
                      color: '#E47C82',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(228, 124, 130, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </>
  );
}

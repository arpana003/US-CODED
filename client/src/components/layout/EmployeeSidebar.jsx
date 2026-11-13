import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Activity,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../auth/BrandLogo';
import sound from '../../utils/sound';
import SettingsModal from '../common/SettingsModal';
import NotificationDrawer from '../common/NotificationDrawer';
import '../../styles/sidebar.css';

export default function EmployeeSidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const toggleCollapse = () => {
    sound.playClick();
    const next = !collapsed;
    setCollapsed(next);
    document.documentElement.style.setProperty(
      '--sidebar-width',
      next ? '72px' : '256px'
    );
  };

  return (
    <>
      <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          {!collapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <BrandLogo size="small" to="/employee/dashboard" clickable={true} />
              <span
                style={{
                  fontSize: '0.65rem',
                  color: '#78DCE8',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  paddingLeft: 4,
                  textTransform: 'uppercase',
                }}
              >
                Employee Portal
              </span>
            </div>
          ) : (
            <div style={{ margin: '0 auto' }}>
              <BrandLogo size="small" to="/employee/dashboard" clickable={true} iconOnly={true} />
            </div>
          )}

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={toggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-nav">
          <span className="nav-section-label">
            {collapsed ? '•••' : 'Workspace'}
          </span>

          <NavLink
            to="/employee/dashboard"
            end
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'My Dashboard' : undefined}
          >
            <span className="nav-item-icon">
              <LayoutDashboard size={17} />
            </span>
            {!collapsed && <span>My Dashboard</span>}
          </NavLink>

          <NavLink
            to="/employee/tasks"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'My Tasks' : undefined}
          >
            <span className="nav-item-icon">
              <CheckSquare size={17} />
            </span>
            {!collapsed && <span>My Tasks</span>}
          </NavLink>

          <NavLink
            to="/employee/projects"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'My Projects' : undefined}
          >
            <span className="nav-item-icon">
              <FolderKanban size={17} />
            </span>
            {!collapsed && <span>My Projects</span>}
          </NavLink>

          <NavLink
            to="/employee/activity"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'My Activity' : undefined}
          >
            <span className="nav-item-icon">
              <Activity size={17} />
            </span>
            {!collapsed && <span>My Activity</span>}
          </NavLink>

          <NavLink
            to="/employee/ai-assistant"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'AI Assistant' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#78DCE8' }}>
              <Sparkles size={17} />
            </span>
            {!collapsed && (
              <>
                <span>AI Assistant</span>
                <span className="nav-badge-pill cyan">Advisor</span>
              </>
            )}
          </NavLink>

          <button
            type="button"
            className="nav-item"
            onClick={() => {
              sound.playPop();
              setIsNotificationsOpen(true);
            }}
            title={collapsed ? 'Notifications' : undefined}
          >
            <span className="nav-item-icon">
              <Bell size={17} />
            </span>
            {!collapsed && <span>Notifications</span>}
          </button>

          {/* ACCOUNT */}
          <span className="nav-section-label" style={{ marginTop: 14 }}>
            {collapsed ? '•••' : 'Account'}
          </span>

          <NavLink
            to="/employee/profile"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'My Profile' : undefined}
          >
            <span className="nav-item-icon">
              <User size={17} />
            </span>
            {!collapsed && <span>My Profile</span>}
          </NavLink>

          <button
            type="button"
            className="nav-item"
            onClick={() => {
              sound.playClick();
              setIsSettingsOpen(true);
            }}
            title={collapsed ? 'Settings' : undefined}
          >
            <span className="nav-item-icon">
              <Settings size={17} />
            </span>
            {!collapsed && <span>Settings</span>}
          </button>
        </div>

        {/* Footer: User Profile & Logout */}
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user-pill">
              <div className="sidebar-user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user.name?.[0]?.toUpperCase() || 'E'}</span>
                )}
              </div>
              {!collapsed && (
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user.name}</div>
                  <div className="sidebar-user-role">
                    {user.designation || 'Team Member'}
                  </div>
                </div>
              )}
              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={() => {
                  sound.playClick();
                  logout();
                }}
                title="Sign out of US-CODED"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Notifications Drawer */}
      <div style={{ position: 'fixed', top: 60, left: collapsed ? 80 : 260, zIndex: 9999 }}>
        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </div>
    </>
  );
}

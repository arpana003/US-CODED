import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Sparkles,
  AlertTriangle,
  Cpu,
  TrendingUp,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain,
  ShieldAlert,
  ListOrdered,
  FlaskConical,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../auth/BrandLogo';
import sound from '../../utils/sound';
import IntelligenceModal from '../common/IntelligenceModal';
import SettingsModal from '../common/SettingsModal';
import NotificationDrawer from '../common/NotificationDrawer';
import '../../styles/sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [intelMode, setIntelMode] = useState(null); // 'predictions' | 'risk' | 'simulation' | 'analytics' | null
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

  const openIntel = (mode) => {
    sound.playPop();
    setIntelMode(mode);
  };

  return (
    <>
      <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          {!collapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <BrandLogo size="small" to="/" clickable={true} />
              <span
                style={{
                  fontSize: '0.65rem',
                  color: '#D8C7A3',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  paddingLeft: 4,
                }}
              >
                Think Ahead. Build Smarter.
              </span>
            </div>
          ) : (
            <div style={{ margin: '0 auto' }}>
              <BrandLogo size="small" to="/" clickable={true} iconOnly={true} />
            </div>
          )}

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={toggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-nav">
          {/* WORKSPACE */}
          <span className="nav-section-label">
            {collapsed ? '•••' : 'Workspace'}
          </span>

          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'Dashboard' : undefined}
          >
            <span className="nav-item-icon">
              <LayoutDashboard size={17} />
            </span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'Projects' : undefined}
          >
            <span className="nav-item-icon">
              <FolderKanban size={17} />
            </span>
            {!collapsed && <span>Projects</span>}
          </NavLink>

          <NavLink
            to="/team"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'Team Management' : undefined}
          >
            <span className="nav-item-icon">
              <Users size={17} />
            </span>
            {!collapsed && <span>Team</span>}
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'Tasks' : undefined}
          >
            <span className="nav-item-icon">
              <CheckSquare size={17} />
            </span>
            {!collapsed && <span>Tasks</span>}
          </NavLink>

          {/* AI INTELLIGENCE */}
          <span className="nav-section-label" style={{ marginTop: 14 }}>
            {collapsed ? '•••' : 'AI Intelligence'}
          </span>

          <NavLink
            to="/ai"
            end
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'AI Command Centre' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#78DCE8' }}>
              <Brain size={17} />
            </span>
            {!collapsed && (
              <>
                <span>Command Centre</span>
                <span className="nav-badge-pill cyan">AI Hub</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/ai/predictions"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'Delay Predictions' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#9B8AFB' }}>
              <TrendingUp size={17} />
            </span>
            {!collapsed && <span>Predictions</span>}
          </NavLink>

          <NavLink
            to="/ai/risks"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'Risk Intelligence' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#E7B86C' }}>
              <ShieldAlert size={17} />
            </span>
            {!collapsed && <span>Risk Matrix</span>}
          </NavLink>

          <NavLink
            to="/ai/tasks"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'Task Prioritization' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#72C9A5' }}>
              <ListOrdered size={17} />
            </span>
            {!collapsed && <span>Task Priority</span>}
          </NavLink>

          <NavLink
            to="/ai/workload"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'Team Workload Intelligence' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#D8C7A3' }}>
              <Users size={17} />
            </span>
            {!collapsed && <span>Workload AI</span>}
          </NavLink>

          <NavLink
            to="/ai/simulation"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'What-If Simulation' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#B5A5FF' }}>
              <FlaskConical size={17} />
            </span>
            {!collapsed && (
              <>
                <span>Simulation</span>
                <span className="nav-badge-pill violet">Sandbox</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/ai/assistant"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'AI Assistant' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#78DCE8' }}>
              <MessageSquare size={17} />
            </span>
            {!collapsed && <span>AI Assistant</span>}
          </NavLink>

          <NavLink
            to="/ai/recommendations"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => sound.playClick()}
            title={collapsed ? 'Recommendation Ledger' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#72C9A5' }}>
              <BookOpen size={17} />
            </span>
            {!collapsed && <span>Decisions</span>}
          </NavLink>

          {/* INTELLIGENCE */}
          <span className="nav-section-label" style={{ marginTop: 14 }}>
            {collapsed ? '•••' : 'Intelligence'}
          </span>

          <button
            type="button"
            className="nav-item"
            onClick={() => openIntel('predictions')}
            title={collapsed ? 'AI Predictions' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#9B8AFB' }}>
              <Sparkles size={17} />
            </span>
            {!collapsed && (
              <>
                <span>AI Predictions</span>
                <span className="nav-badge-pill violet">Neural</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={() => openIntel('risk')}
            title={collapsed ? 'Risk Analysis' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#E7B86C' }}>
              <AlertTriangle size={17} />
            </span>
            {!collapsed && (
              <>
                <span>Risk Analysis</span>
                <span className="nav-badge-pill amber">Live</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={() => openIntel('simulation')}
            title={collapsed ? 'Future Simulation' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#78DCE8' }}>
              <Cpu size={17} />
            </span>
            {!collapsed && (
              <>
                <span>Future Simulation</span>
                <span className="nav-badge-pill cyan">Twin</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={() => openIntel('analytics')}
            title={collapsed ? 'Analytics' : undefined}
          >
            <span className="nav-item-icon" style={{ color: '#72C9A5' }}>
              <TrendingUp size={17} />
            </span>
            {!collapsed && <span>Analytics</span>}
          </button>

          {/* ACCOUNT */}
          <span className="nav-section-label" style={{ marginTop: 14 }}>
            {collapsed ? '•••' : 'Account'}
          </span>

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

          <button
            type="button"
            className="nav-item"
            onClick={() => {
              sound.playClick();
              window.open('https://github.com', '_blank');
            }}
            title={collapsed ? 'Help & Documentation' : undefined}
          >
            <span className="nav-item-icon">
              <HelpCircle size={17} />
            </span>
            {!collapsed && <span>Documentation</span>}
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
                  <span>{user.name?.[0]?.toUpperCase() || 'A'}</span>
                )}
              </div>
              {!collapsed && (
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user.name}</div>
                  <div className="sidebar-user-role">
                    {user.role === 'admin' ? 'Lead Architect' : user.role}
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

      {/* Intelligence Simulation Modal */}
      <IntelligenceModal
        isOpen={!!intelMode}
        onClose={() => setIntelMode(null)}
        mode={intelMode || 'predictions'}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Notifications Drawer (when clicked from sidebar) */}
      <div style={{ position: 'fixed', top: 60, left: collapsed ? 80 : 260, zIndex: 9999 }}>
        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </div>
    </>
  );
}

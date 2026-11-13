import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AmbientBackground from '../common/AmbientBackground';

export default function AppLayout() {
  return (
    <div className="app-layout" style={{ position: 'relative' }}>
      <AmbientBackground />
      <Sidebar />
      <div className="main-content" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <Outlet />
      </div>
    </div>
  );
}

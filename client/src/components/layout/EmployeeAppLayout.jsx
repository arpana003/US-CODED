import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from './EmployeeSidebar';
import AmbientBackground from '../common/AmbientBackground';

export default function EmployeeAppLayout() {
  return (
    <div className="app-layout" style={{ position: 'relative' }}>
      <AmbientBackground />
      <EmployeeSidebar />
      <div className="main-content" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <Outlet />
      </div>
    </div>
  );
}

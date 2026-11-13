import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../auth/BrandLogo';

export default function RoleRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#080B16',
          color: '#F8FAFC',
          gap: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ transform: 'scale(1.1)', position: 'relative', zIndex: 1 }}>
          <BrandLogo size="medium" />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#94A3B8',
            fontSize: '0.875rem',
            letterSpacing: '0.04em',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              borderTopColor: '#22D3EE',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span>Verifying access permissions…</span>
        </div>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their appropriate home according to their role
    const dest = user?.role === 'admin' ? '/' : '/employee/dashboard';
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
}


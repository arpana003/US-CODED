import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, AlertCircle, Sparkles, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import PasswordInput from '../components/auth/PasswordInput';
import AuthButton from '../components/auth/AuthButton';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';

const MODE_CONFIG = {
  admin: {
    heading: 'Welcome Back, Admin.',
    subheading: 'Sign in to manage your workspace.',
    btnText: 'Sign In as Admin',
    emailPlaceholder: 'admin@uscoded.io',
    pill: 'Admin Access',
    demoEmail: 'admin@uscoded.io',
    demoPassword: 'Admin@12345',
    demoLabel: 'Admin Demo',
  },
  employee: {
    heading: 'Welcome to Your Workspace.',
    subheading: 'Sign in to access your assigned tasks.',
    btnText: 'Sign In as Employee',
    emailPlaceholder: 'priya@uscoded.io',
    pill: 'Employee Access',
    demoEmail: 'priya@uscoded.io',
    demoPassword: 'Emp@12345',
    demoLabel: 'Employee Demo (Priya)',
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginMode, setLoginMode] = useState('admin');
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const from = location.state?.from?.pathname;
  const cfg = MODE_CONFIG[loginMode];

  const handleModeChange = (mode) => {
    if (mode === loginMode) return;
    setLoginMode(mode);
    setFormData({ email: '', password: '', rememberMe: true });
    setErrors({});
    setFormError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setFormError('');
    try {
      const res = await login(formData.email.trim(), formData.password, formData.rememberMe, loginMode);
      toast.success(`Welcome back, ${res.user.name}!`);
      const dest = res.user.role === 'admin' ? (from || '/') : '/employee/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please verify your credentials.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setFormData({ email: cfg.demoEmail, password: cfg.demoPassword, rememberMe: true });
    setErrors({});
    setFormError('');
  };

  return (
    <AuthLayout
      headline="Your Projects. One Intelligent Future."
      subparagraph="Take control of every project with intelligent monitoring, predictive insights, and smarter decisions."
    >
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Mode Switcher */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-mode-tab${loginMode === 'admin' ? ' active' : ''}`}
            onClick={() => handleModeChange('admin')}
          >
            <Shield size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Admin Login
          </button>
          <button
            type="button"
            className={`auth-mode-tab${loginMode === 'employee' ? ' active' : ''}`}
            onClick={() => handleModeChange('employee')}
          >
            <Users size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Employee Login
          </button>
        </div>

        {/* Card Header — animated on mode change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={loginMode}
            className="auth-card-header"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="auth-step-pill">
              <span className="step-dot" />
              <span>{cfg.pill}</span>
            </div>
            <h2 className="auth-card-heading">{cfg.heading}</h2>
            <p className="auth-card-subheading">{cfg.subheading}</p>
          </motion.div>
        </AnimatePresence>

        {/* Global Error Banner */}
        {formError && (
          <motion.div
            className="auth-form-alert error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            role="alert"
          >
            <AlertCircle size={18} className="alert-icon" />
            <div className="alert-text">
              <strong>Authentication Error:</strong> {formError}
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <AuthInput
            label="Email Address"
            id="login-email"
            name="email"
            type="email"
            placeholder={cfg.emailPlaceholder}
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            error={errors.email}
            autoComplete="username email"
            required
            disabled={loading}
          />

          <PasswordInput
            label="Password"
            id="login-password"
            name="password"
            placeholder="••••••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
            required
            disabled={loading}
          />

          <div className="auth-form-options">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                className="auth-checkbox-input"
              />
              <span className="auth-checkbox-custom" />
              <span className="auth-checkbox-text">Remember me</span>
            </label>

            <button
              type="button"
              className="auth-link-text-btn"
              onClick={() => setIsForgotModalOpen(true)}
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>

          <AuthButton type="submit" loading={loading} loadingText="Authenticating…">
            {cfg.btnText}
          </AuthButton>

          <div className="auth-switch-prompt">
            <span>Don&apos;t have an account?</span>{' '}
            <Link to="/signup" className="auth-inline-link">
              Create one
            </Link>
          </div>

          <div className="auth-divider">
            <span className="divider-line" />
            <span className="divider-badge">DEMO WORKSPACE ACCESS</span>
            <span className="divider-line" />
          </div>

          <div className="demo-credentials-box">
            <div className="demo-credentials-header">
              <div className="demo-icon">
                <Sparkles size={14} color="#22D3EE" />
              </div>
              <span className="demo-label">Quick Testing Credentials</span>
            </div>
            <div className="demo-actions-row">
              <button
                type="button"
                className="demo-pill-btn"
                onClick={handleFillDemo}
                title={`Fill ${cfg.demoLabel} credentials`}
              >
                <span>{cfg.demoLabel}</span>
              </button>
              {loginMode === 'employee' && (
                <button
                  type="button"
                  className="demo-pill-btn"
                  onClick={() =>
                    setFormData({ email: 'david@uscoded.io', password: 'Emp@12345', rememberMe: true })
                  }
                  title="Fill David (Employee) credentials"
                >
                  <span>Employee Demo (David)</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={formData.email}
      />
    </AuthLayout>
  );
}

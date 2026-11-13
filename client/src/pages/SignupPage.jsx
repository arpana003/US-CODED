import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import PasswordInput from '../components/auth/PasswordInput';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import AuthButton from '../components/auth/AuthButton';
import TermsModal from '../components/auth/TermsModal';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid work email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service to continue.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFormError('');

    try {
      const res = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );
      toast.success(res.message || 'Account created successfully! Welcome to US-CODED.');
      const dest = res.user?.role === 'admin' ? '/' : '/employee/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.message || 'Registration failed. Please check your information.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Think Ahead. Build Smarter."
      subparagraph="Where intelligent planning meets the future of project management. Provision your AI-augmented workspace in seconds."
    >
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Card Header */}
        <div className="auth-card-header">
          <div className="auth-step-pill">
            <span className="step-dot active" />
            <span>Workspace Provisioning</span>
          </div>
          <h2 className="auth-card-heading">Create your account.</h2>
          <p className="auth-card-subheading">
            Start building smarter projects with US-CODED.
          </p>
        </div>

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
              <strong>Registration Notice:</strong> {formError}
            </div>
          </motion.div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name */}
          <AuthInput
            label="Full Name"
            id="signup-name"
            name="name"
            type="text"
            placeholder="Elena Rostova"
            value={formData.name}
            onChange={handleChange}
            icon={User}
            error={errors.name}
            autoComplete="name"
            required
            disabled={loading}
          />

          {/* Email Field */}
          <AuthInput
            label="Work Email"
            id="signup-email"
            name="email"
            type="email"
            placeholder="elena@company.com"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            error={errors.email}
            autoComplete="email"
            required
            disabled={loading}
          />

          {/* Password Field */}
          <PasswordInput
            label="Create Password"
            id="signup-password"
            name="password"
            placeholder="Min. 8 chars, uppercase & symbol"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
            required
            disabled={loading}
          />

          {/* Password Strength Meter */}
          <PasswordStrengthMeter password={formData.password} />

          {/* Confirm Password Field */}
          <PasswordInput
            label="Confirm Password"
            id="signup-confirm-password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
            required
            disabled={loading}
          />

          {/* Terms & Conditions Checkbox */}
          <div className="auth-terms-group">
            <label className="auth-checkbox-label align-top">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                disabled={loading}
                className="auth-checkbox-input"
              />
              <span className="auth-checkbox-custom" />
              <span className="auth-checkbox-text">
                I agree to the{' '}
                <button
                  type="button"
                  className="auth-link-text-btn inline"
                  onClick={() => setIsTermsOpen(true)}
                >
                  Terms of Service
                </button>{' '}
                and Privacy Policy of US-CODED.
              </span>
            </label>
            {errors.agreeTerms && (
              <div className="auth-input-error-msg" style={{ marginTop: '4px' }}>
                <span>{errors.agreeTerms}</span>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <AuthButton
            type="submit"
            loading={loading}
            loadingText="Provisioning Workspace…"
          >
            Create US-CODED Account
          </AuthButton>

          {/* Switch to Login */}
          <div className="auth-switch-prompt">
            <span>Already have an account?</span>{' '}
            <Link to="/login" className="auth-inline-link">
              Sign in
            </Link>
          </div>
        </form>
      </motion.div>

      {/* Terms & Conditions Modal */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </AuthLayout>
  );
}

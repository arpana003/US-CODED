import { useState } from 'react';
import { Mail, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../../services/api';
import AuthInput from './AuthInput';
import AuthButton from './AuthButton';

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to process reset request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <div className="auth-modal-overlay" onClick={handleReset}>
      <div
        className="auth-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
      >
        {/* Close Button */}
        <button
          className="auth-modal-close-btn"
          onClick={handleReset}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="auth-modal-success-view">
            <div className="success-icon-badge">
              <CheckCircle2 size={36} color="#22D3EE" />
            </div>
            <h3 className="auth-modal-title">Instructions Dispatched</h3>
            <p className="auth-modal-desc">
              If an account with <strong>{email}</strong> exists, password reset instructions and a secure recovery link have been sent.
            </p>
            <AuthButton
              type="button"
              onClick={handleReset}
              variant="primary"
            >
              Return to Sign In
            </AuthButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-modal-form">
            <div className="auth-modal-header">
              <div className="modal-icon-badge">
                <Mail size={22} color="#8B5CF6" />
              </div>
              <h3 id="forgot-password-title" className="auth-modal-title">
                Reset your password
              </h3>
              <p className="auth-modal-desc">
                Enter your work email address and we will send you secure recovery instructions to regain access to US-CODED.
              </p>
            </div>

            {error && (
              <div className="auth-form-alert error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <AuthInput
              label="Work Email"
              id="reset-email"
              type="email"
              placeholder="abhra@uscoded.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
              autoFocus
            />

            <div className="auth-modal-actions">
              <button
                type="button"
                className="auth-modal-cancel-btn"
                onClick={handleReset}
              >
                Cancel
              </button>
              <AuthButton
                type="submit"
                loading={loading}
                loadingText="Sending link…"
                fullWidth={false}
              >
                Send Reset Link
              </AuthButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

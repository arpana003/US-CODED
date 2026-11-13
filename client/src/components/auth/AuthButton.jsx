import { ArrowRight, Loader2 } from 'lucide-react';

export default function AuthButton({
  children,
  type = 'submit',
  variant = 'primary',
  loading = false,
  loadingText = 'Processing…',
  disabled = false,
  onClick,
  icon: Icon = ArrowRight,
  className = '',
  fullWidth = true,
}) {
  const isButtonDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isButtonDisabled}
      onClick={onClick}
      className={`auth-btn auth-btn-${variant} ${fullWidth ? 'full-width' : ''} ${
        loading ? 'is-loading' : ''
      } ${className}`}
    >
      {/* Button Ambient Shimmer Glow */}
      <span className="auth-btn-glow" />

      <span className="auth-btn-content">
        {loading ? (
          <>
            <Loader2 size={18} className="auth-btn-spinner" />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            <span>{children}</span>
            {Icon && <Icon size={18} className="auth-btn-arrow-icon" />}
          </>
        )}
      </span>
    </button>
  );
}

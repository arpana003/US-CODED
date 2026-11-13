import { forwardRef } from 'react';

const AuthInput = forwardRef(
  (
    {
      label,
      id,
      name,
      type = 'text',
      placeholder,
      value,
      onChange,
      onBlur,
      icon: Icon,
      error,
      autoComplete,
      required = false,
      disabled = false,
      className = '',
      rightElement = null,
      hint = null,
    },
    ref
  ) => {
    return (
      <div className={`auth-input-group ${error ? 'has-error' : ''} ${className}`}>
        {label && (
          <div className="auth-input-label-row">
            <label htmlFor={id || name} className="auth-input-label">
              {label}
              {required && <span className="auth-required-star">*</span>}
            </label>
            {hint && <span className="auth-input-hint">{hint}</span>}
          </div>
        )}

        <div className="auth-input-wrapper">
          {Icon && (
            <div className="auth-input-icon-left">
              <Icon size={18} />
            </div>
          )}

          <input
            ref={ref}
            id={id || name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            autoComplete={autoComplete}
            required={required}
            disabled={disabled}
            className={`auth-input-field ${Icon ? 'with-left-icon' : ''} ${
              rightElement ? 'with-right-element' : ''
            }`}
          />

          {rightElement && (
            <div className="auth-input-element-right">{rightElement}</div>
          )}
        </div>

        {error && (
          <div className="auth-input-error-msg" role="alert">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;

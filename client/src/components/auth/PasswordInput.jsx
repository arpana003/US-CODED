import { useState, forwardRef } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import AuthInput from './AuthInput';

const PasswordInput = forwardRef(
  (
    {
      label = 'Password',
      id = 'password',
      name = 'password',
      placeholder = '••••••••••••',
      value,
      onChange,
      onBlur,
      error,
      autoComplete = 'current-password',
      required = false,
      disabled = false,
      hint,
      className = '',
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <AuthInput
        ref={ref}
        label={label}
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        icon={Lock}
        error={error}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        hint={hint}
        className={className}
        rightElement={
          <button
            type="button"
            className="auth-password-toggle-btn"
            onClick={toggleVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={18} className="toggle-icon active" />
            ) : (
              <Eye size={18} className="toggle-icon" />
            )}
          </button>
        }
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;

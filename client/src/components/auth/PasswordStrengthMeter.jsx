import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

export default function PasswordStrengthMeter({ password = '' }) {
  const analysis = useMemo(() => {
    const checks = [
      { id: 'length', label: 'At least 8 characters', valid: password.length >= 8 },
      { id: 'uppercase', label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
      { id: 'number', label: 'At least one number', valid: /[0-9]/.test(password) },
      { id: 'special', label: 'Special symbol (!@#$%^&*)', valid: /[^A-Za-z0-9]/.test(password) },
    ];

    const passedCount = checks.filter((c) => c.valid).length;

    let score = 0;
    let label = 'Very Weak';
    let color = '#ef4444'; // Red

    if (password.length === 0) {
      score = 0;
      label = '';
      color = 'transparent';
    } else if (passedCount <= 1) {
      score = 1;
      label = 'Weak';
      color = '#ef4444';
    } else if (passedCount === 2) {
      score = 2;
      label = 'Fair';
      color = '#f59e0b'; // Amber
    } else if (passedCount === 3) {
      score = 3;
      label = 'Good';
      color = '#6366F1'; // Electric blue
    } else if (passedCount === 4) {
      score = 4;
      label = 'Strong';
      color = '#22D3EE'; // Cyan / Emerald
    }

    return { checks, score, label, color };
  }, [password]);

  if (!password) return null;

  return (
    <div className="password-strength-container">
      <div className="password-strength-header">
        <span className="strength-label">Password Strength:</span>
        <span className="strength-value" style={{ color: analysis.color }}>
          {analysis.label}
        </span>
      </div>

      {/* 4-Segment Progress Bar */}
      <div className="password-strength-bars">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={`strength-bar-segment ${seg <= analysis.score ? 'active' : ''}`}
            style={{
              backgroundColor: seg <= analysis.score ? analysis.color : 'rgba(255, 255, 255, 0.08)',
            }}
          />
        ))}
      </div>

      {/* Validation Criteria Badges */}
      <div className="password-criteria-list">
        {analysis.checks.map((chk) => (
          <div
            key={chk.id}
            className={`criteria-item ${chk.valid ? 'valid' : 'invalid'}`}
          >
            {chk.valid ? (
              <Check size={12} className="criteria-icon valid-icon" />
            ) : (
              <X size={12} className="criteria-icon invalid-icon" />
            )}
            <span>{chk.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

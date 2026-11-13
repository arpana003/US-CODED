import { Link } from 'react-router-dom';

export default function BrandLogo({
  size = 'medium',
  showTagline = false,
  iconOnly = false,
  to = '/',
  clickable = true,
  className = '',
}) {
  const sizeMap = {
    small: { icon: 28, text: '1.1rem', sub: '0.65rem', gap: 10 },
    medium: { icon: 38, text: '1.45rem', sub: '0.725rem', gap: 12 },
    large: { icon: 48, text: '1.85rem', sub: '0.825rem', gap: 16 },
  };

  const currentSize = sizeMap[size] || sizeMap.medium;

  const content = (
    <div
      className={`uscoded-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${currentSize.gap}px`,
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      {/* High-Fidelity Futuristic Geometric Monogram Icon */}
      <div
        className="brand-icon-wrapper"
        style={{
          width: currentSize.icon,
          height: currentSize.icon,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* Ambient Backlight Glow */}
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '12px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, rgba(34, 211, 238, 0.15) 60%, transparent 80%)',
            filter: 'blur(8px)',
            opacity: 0.8,
            pointerEvents: 'none',
          }}
        />

        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <defs>
            <linearGradient id="usCodedGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            <linearGradient id="usCodedGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Rounded Squircle Base */}
          <rect
            x="2"
            y="2"
            width="40"
            height="40"
            rx="11"
            fill="#101426"
            stroke="url(#usCodedGrad1)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Connected Circuit Grid lines */}
          <path
            d="M 6 22 H 14 M 30 22 H 38 M 22 6 V 12 M 22 32 V 38"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Stylized 'U' Monogram & Twin Nodes */}
          {/* Left vertical stem */}
          <path
            d="M 13 13 V 24 C 13 28.97 17.03 33 22 33 C 26.97 33 31 28.97 31 24 V 13"
            stroke="url(#usCodedGrad1)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Intersecting Digital Core Bar */}
          <path
            d="M 17 21 H 27"
            stroke="url(#usCodedGrad2)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Center Digital Twin Glowing Core Node */}
          <circle
            cx="22"
            cy="21"
            r="3"
            fill="#22D3EE"
            filter="url(#nodeGlow)"
          />

          {/* Upper Left Node */}
          <circle cx="13" cy="13" r="2.2" fill="#8B5CF6" />
          {/* Upper Right Node */}
          <circle cx="31" cy="13" r="2.2" fill="#22D3EE" />
          {/* Base Anchor Node */}
          <circle cx="22" cy="33" r="1.8" fill="#6366F1" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {!iconOnly && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: currentSize.text,
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1,
                color: '#F8FAFC',
                display: 'inline-flex',
                alignItems: 'baseline',
              }}
            >
              US<span style={{ color: '#22D3EE', margin: '0 1px' }}>-</span>CODED
            </span>

            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#8B5CF6',
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '2px 6px',
                borderRadius: '6px',
                lineHeight: 1,
              }}
            >
              SaaS
            </span>
          </div>

          {showTagline && (
            <span
              style={{
                fontSize: currentSize.sub,
                color: '#94A3B8',
                fontWeight: 500,
                letterSpacing: '0.03em',
                marginTop: '4px',
              }}
            >
              Think Ahead. Build Smarter.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (clickable) {
    return <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  return content;
}

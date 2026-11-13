import React from 'react';

export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        background: '#101116',
      }}
    >
      {/* Subtle Micro-Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.7,
        }}
      />

      {/* Primary Ambient Light Orb 1 — Muted Violet (Top Left) */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(155, 138, 251, 0.07) 0%, rgba(181, 165, 255, 0.02) 45%, transparent 70%)',
          filter: 'blur(80px)',
          transform: 'translateZ(0)',
          animation: 'ambientFloat1 18s ease-in-out infinite alternate',
        }}
      />

      {/* Primary Ambient Light Orb 2 — Soft Cyan (Bottom Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '5%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120, 220, 232, 0.05) 0%, rgba(113, 137, 201, 0.02) 50%, transparent 70%)',
          filter: 'blur(90px)',
          transform: 'translateZ(0)',
          animation: 'ambientFloat2 24s ease-in-out infinite alternate',
        }}
      />

      {/* Subtle Warm Beige Accent (Center Right) */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          right: '25%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(216, 199, 163, 0.03) 0%, transparent 65%)',
          filter: 'blur(100px)',
          transform: 'translateZ(0)',
        }}
      />

      {/* Soft Vignette Overlay to frame content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(16, 17, 22, 0.5) 100%)',
        }}
      />

      <style>{`
        @keyframes ambientFloat1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.08); }
          100% { transform: translate(-25px, 50px) scale(0.96); }
        }
        @keyframes ambientFloat2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-45px, -35px) scale(1.06); }
          100% { transform: translate(30px, -20px) scale(0.94); }
        }
      `}</style>
    </div>
  );
}


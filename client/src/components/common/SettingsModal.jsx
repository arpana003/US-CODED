import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Shield, Sparkles, X } from 'lucide-react';
import sound from '../../utils/sound';
import toast from 'react-hot-toast';

export default function SettingsModal({ isOpen, onClose }) {
  const [soundActive, setSoundActive] = useState(sound.isEnabled());
  const [ambientGlow, setAmbientGlow] = useState(true);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const updated = sound.toggle();
    setSoundActive(updated);
    toast.success(updated ? 'UI Sound Effects Enabled' : 'UI Sound Effects Muted');
  };

  const handleSave = () => {
    sound.playSuccess();
    toast.success('Workspace preferences saved');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 12, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#15161B',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 24px rgba(155, 138, 251, 0.12)',
          overflow: 'hidden',
          animation: 'paletteEntrance 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(27, 29, 36, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(155, 138, 251, 0.2)',
                color: '#B5A5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F4F2EE', margin: 0 }}>
                Workspace Preferences
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#A5A5B0', margin: 0 }}>
                Customize your US-CODED environment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#A5A5B0',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Body Options */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Sound Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#101116',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {soundActive ? <Volume2 size={18} color="#9B8AFB" /> : <VolumeX size={18} color="#6D6F7C" />}
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F4F2EE' }}>
                  Micro-Interaction Sounds
                </div>
                <div style={{ fontSize: '0.75rem', color: '#A5A5B0' }}>
                  Subtle audio feedback for clicks, success chords, and alerts
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleSound}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: soundActive ? 'linear-gradient(135deg, #9B8AFB, #B5A5FF)' : 'rgba(255, 255, 255, 0.08)',
                color: soundActive ? '#101116' : '#A5A5B0',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {soundActive ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Ambient Glow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#101116',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Sparkles size={18} color="#78DCE8" />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F4F2EE' }}>
                  Atmospheric Backlight
                </div>
                <div style={{ fontSize: '0.75rem', color: '#A5A5B0' }}>
                  Deep graphite glow &amp; subtle particle diffusion
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setAmbientGlow(!ambientGlow);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: ambientGlow ? 'rgba(120, 220, 232, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                color: ambientGlow ? '#78DCE8' : '#A5A5B0',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {ambientGlow ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {/* Real-time Socket sync */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#101116',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Shield size={18} color="#D8C7A3" />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F4F2EE' }}>
                  Digital Twin Live Telemetry
                </div>
                <div style={{ fontSize: '0.75rem', color: '#A5A5B0' }}>
                  Real-time WebSockets synchronization enabled
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#72C9A5',
                background: 'rgba(114, 201, 165, 0.15)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              CONNECTED
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#101116',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '7px 16px', fontSize: '0.8125rem' }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary"
            style={{ padding: '7px 18px', fontSize: '0.8125rem' }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

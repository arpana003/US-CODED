import { ShieldCheck } from 'lucide-react';

export default function AuthFooter({ onOpenTerms }) {
  return (
    <footer className="auth-footer-bar">
      <div className="auth-footer-left">
        <div className="system-status-indicator">
          <span className="status-ping-dot" />
          <span className="status-label">All Systems Operational</span>
        </div>
        <span className="footer-separator">·</span>
        <span className="footer-meta">Latency 24ms</span>
      </div>

      <div className="auth-footer-right">
        <div className="footer-security-badge">
          <ShieldCheck size={14} color="#22D3EE" />
          <span>256-Bit TLS Encrypted</span>
        </div>
        <span className="footer-separator">·</span>
        <button
          type="button"
          className="footer-link-btn"
          onClick={onOpenTerms}
        >
          Terms & Privacy
        </button>
      </div>
    </footer>
  );
}

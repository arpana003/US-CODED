import { X, ShieldCheck } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal-dialog terms-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
      >
        <button
          className="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="auth-modal-header">
          <div className="modal-icon-badge">
            <ShieldCheck size={22} color="#22D3EE" />
          </div>
          <h3 id="terms-title" className="auth-modal-title">
            US-CODED Platform Terms
          </h3>
          <p className="auth-modal-desc">
            Enterprise Terms of Service & Digital Twin Data Governance
          </p>
        </div>

        <div className="terms-content-scroll">
          <h4>1. Acceptance of Terms</h4>
          <p>
            By accessing or creating an account on the US-CODED platform, you agree to comply with our digital twin orchestration standards, confidentiality covenants, and data policies.
          </p>

          <h4>2. Telemetry & Twin Security</h4>
          <p>
            All telemetry streams, task structures, and predictive models are safeguarded under end-to-end TLS encryption and granular role-based access control.
          </p>

          <h4>3. Account Responsibilities</h4>
          <p>
            Users are solely responsible for maintaining the confidentiality of their credentials and all activities occurring under their provisioned workspace.
          </p>
        </div>

        <div className="auth-modal-actions" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            type="button"
            className="auth-btn auth-btn-primary"
            style={{ width: 'auto', padding: '10px 24px' }}
            onClick={onClose}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

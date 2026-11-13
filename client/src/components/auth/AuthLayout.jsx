import { useState } from 'react';
import BrandLogo from './BrandLogo';
import AnimatedBackground from './AnimatedBackground';
import ConnectedNetworkVisual from './ConnectedNetworkVisual';
import AuthFooter from './AuthFooter';
import TermsModal from './TermsModal';

export default function AuthLayout({
  children,
  headline = 'Your Projects. One Intelligent Future.',
  subparagraph = 'Take control of every project with intelligent monitoring, predictive insights, and smarter decisions.',
}) {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <div className="auth-root-wrapper">
      {/* Background Animated Atmosphere */}
      <AnimatedBackground />

      <div className="auth-main-container">
        {/* LEFT SIDE — BRAND EXPERIENCE (55% Desktop) */}
        <section className="auth-brand-section" aria-label="Brand Overview">
          <div className="auth-brand-inner">
            {/* Top Brand Logo */}
            <div className="auth-brand-header">
              <BrandLogo size="medium" showTagline={true} />
            </div>

            {/* Core Value Proposition Narrative */}
            <div className="auth-brand-narrative">
              <div className="auth-brand-badge">
                <span className="badge-pulse-dot" />
                <span>Next-Gen Digital Twin Architecture</span>
              </div>

              <h1 className="auth-brand-headline">{headline}</h1>

              <p className="auth-brand-subparagraph">{subparagraph}</p>
            </div>

            {/* Connected Digital Ecosystem 3D-Style Graphic & Feature Highlights */}
            <div className="auth-brand-visual-area">
              <ConnectedNetworkVisual />
            </div>
          </div>
        </section>

        {/* RIGHT SIDE — AUTHENTICATION CARD (45% Desktop) */}
        <section className="auth-card-section" aria-label="Authentication Form">
          <div className="auth-card-inner">
            {/* Mobile / Tablet Header Logo (shown when left section is hidden or on narrow viewports) */}
            <div className="auth-mobile-header">
              <BrandLogo size="medium" showTagline={true} />
            </div>

            {/* Main Form Content Container */}
            <div className="auth-card-wrapper">{children}</div>
          </div>
        </section>
      </div>

      {/* Global Minimalist Auth Footer */}
      <AuthFooter onOpenTerms={() => setIsTermsOpen(true)} />

      {/* Terms & Privacy Modal */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}

import { Cpu, Activity, Sparkles, Shield, GitBranch, Layers } from 'lucide-react';

export default function ConnectedNetworkVisual() {
  const features = [
    {
      num: '01',
      title: 'Intelligent Project Planning',
      desc: 'Dynamic task simulation & automated critical path optimization.',
      icon: Layers,
      color: '#8B5CF6',
    },
    {
      num: '02',
      title: 'Real-Time Monitoring',
      desc: 'Sub-second synchronization across digital twin telemetry streams.',
      icon: Activity,
      color: '#22D3EE',
    },
    {
      num: '03',
      title: 'Predictive Intelligence',
      desc: 'Early bottleneck detection & proactive schedule risk mitigation.',
      icon: Sparkles,
      color: '#6366F1',
    },
  ];

  return (
    <div className="network-visual-container">
      {/* 3D-Style Futuristic Floating Digital Ecosystem Orb & Nodes */}
      <div className="network-graphic-wrapper">
        <svg
          viewBox="0 0 520 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="network-svg"
        >
          <defs>
            <linearGradient id="orbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="45%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#101426" />
            </linearGradient>

            <linearGradient id="lineGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.7)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.2)" />
            </linearGradient>

            <linearGradient id="lineGradPurple" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.8)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.2)" />
            </linearGradient>

            <filter id="coreGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="nodeGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Perspective Plane Grid Ellipses */}
          <g opacity="0.35" transform="translate(0, 20)">
            <ellipse
              cx="260"
              cy="200"
              rx="230"
              ry="75"
              stroke="rgba(139, 92, 246, 0.25)"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              className="anim-spin-slow"
            />
            <ellipse
              cx="260"
              cy="200"
              rx="170"
              ry="55"
              stroke="rgba(34, 211, 238, 0.3)"
              strokeWidth="1.2"
              className="anim-spin-reverse"
            />
            <ellipse
              cx="260"
              cy="200"
              rx="110"
              ry="36"
              stroke="rgba(99, 102, 241, 0.4)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          </g>

          {/* Interconnected Circuit Vectors & Flowing Pulses */}
          <g className="network-vectors">
            {/* Upper connections */}
            <path
              d="M 90 90 Q 180 140 260 170"
              stroke="url(#lineGradPurple)"
              strokeWidth="1.5"
            />
            <path
              d="M 430 80 Q 350 130 260 170"
              stroke="url(#lineGradCyan)"
              strokeWidth="1.5"
            />
            {/* Lower connections */}
            <path
              d="M 120 280 Q 190 230 260 170"
              stroke="url(#lineGradCyan)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M 400 290 Q 330 230 260 170"
              stroke="url(#lineGradPurple)"
              strokeWidth="1.5"
            />
            {/* Horizontal bridge */}
            <path
              d="M 70 190 H 450"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
          </g>

          {/* Central Digital Core: Glowing 3D-Style Orb */}
          <g transform="translate(260, 170)" className="floating-orb-group">
            {/* Deep Back Glow */}
            <circle
              r="62"
              fill="url(#orbGradient)"
              opacity="0.25"
              filter="url(#coreGlow)"
            />

            {/* Concentric Pulsing Rings */}
            <circle
              r="48"
              fill="none"
              stroke="rgba(34, 211, 238, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              className="anim-pulse-ring"
            />
            <circle
              r="36"
              fill="#101426"
              stroke="url(#orbGradient)"
              strokeWidth="2.5"
            />
            <circle
              r="22"
              fill="url(#orbGradient)"
              opacity="0.85"
              filter="url(#coreGlow)"
            />
            <circle r="10" fill="#F8FAFC" />

            {/* Orbiting Telemetry Dot */}
            <g className="anim-orbit">
              <circle cx="48" cy="0" r="3.5" fill="#22D3EE" filter="url(#nodeGlowFilter)" />
            </g>
          </g>

          {/* Peripheral Satellite Digital Twin Nodes */}
          {/* Node 1: Top Left */}
          <g transform="translate(90, 90)">
            <circle r="18" fill="#151A30" stroke="#8B5CF6" strokeWidth="1.5" />
            <circle r="5" fill="#8B5CF6" filter="url(#nodeGlowFilter)" />
            <text x="24" y="4" fill="#94A3B8" fontSize="11" fontFamily="'JetBrains Mono', monospace">TWIN-01</text>
          </g>

          {/* Node 2: Top Right */}
          <g transform="translate(430, 80)">
            <circle r="18" fill="#151A30" stroke="#22D3EE" strokeWidth="1.5" />
            <circle r="5" fill="#22D3EE" filter="url(#nodeGlowFilter)" />
            <text x="-76" y="4" fill="#94A3B8" fontSize="11" fontFamily="'JetBrains Mono', monospace">AI-NODE</text>
          </g>

          {/* Node 3: Bottom Left */}
          <g transform="translate(120, 280)">
            <circle r="16" fill="#151A30" stroke="#6366F1" strokeWidth="1.5" />
            <circle r="4" fill="#6366F1" filter="url(#nodeGlowFilter)" />
            <text x="22" y="4" fill="#94A3B8" fontSize="11" fontFamily="'JetBrains Mono', monospace">TELEMETRY</text>
          </g>

          {/* Node 4: Bottom Right */}
          <g transform="translate(400, 290)">
            <circle r="16" fill="#151A30" stroke="#22D3EE" strokeWidth="1.5" />
            <circle r="4" fill="#22D3EE" filter="url(#nodeGlowFilter)" />
            <text x="-64" y="4" fill="#94A3B8" fontSize="11" fontFamily="'JetBrains Mono', monospace">SYNC: 99.8%</text>
          </g>
        </svg>

        {/* Floating Real-Time Status Pill */}
        <div className="floating-metric-card top-metric">
          <div className="metric-dot" />
          <span className="metric-title">Autonomous Project Twin</span>
          <span className="metric-badge">Live Stream</span>
        </div>

        <div className="floating-metric-card bottom-metric">
          <GitBranch size={14} color="#8B5CF6" />
          <span className="metric-title">Smart Path Prediction: Active</span>
        </div>
      </div>

      {/* Feature Highlights Section */}
      <div className="feature-highlights-grid">
        {features.map((feat) => {
          const IconComp = feat.icon;
          return (
            <div key={feat.num} className="feature-highlight-card">
              <div className="feature-highlight-header">
                <span className="feature-highlight-num" style={{ color: feat.color }}>
                  {feat.num}
                </span>
                <div
                  className="feature-icon-badge"
                  style={{
                    background: `rgba(${feat.color === '#8B5CF6' ? '139, 92, 246' : feat.color === '#22D3EE' ? '34, 211, 238' : '99, 102, 241'}, 0.12)`,
                    border: `1px solid rgba(${feat.color === '#8B5CF6' ? '139, 92, 246' : feat.color === '#22D3EE' ? '34, 211, 238' : '99, 102, 241'}, 0.25)`,
                  }}
                >
                  <IconComp size={15} color={feat.color} />
                </div>
              </div>
              <h4 className="feature-highlight-title">{feat.title}</h4>
              <p className="feature-highlight-desc">{feat.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// RSC — Security camera SVG visual, 1:1 port from visuals.jsx

export default function SecurityVisual() {
  return (
    <svg viewBox="0 0 500 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sec-bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0A0C0A"/>
          <stop offset="1" stopColor="#020302"/>
        </linearGradient>
        <radialGradient id="sec-glow">
          <stop offset="0" stopColor="#FFC107" stopOpacity="0.3"/>
          <stop offset="1" stopColor="#FFC107" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="500" height="620" fill="url(#sec-bg)"/>
      {/* camera lens */}
      <g transform="translate(250, 240)">
        <circle r="160" fill="url(#sec-glow)"/>
        <circle r="100" fill="#0F1114" stroke="#262B28" strokeWidth="1"/>
        <circle r="80" fill="#050606" stroke="#1F2320" strokeWidth="1"/>
        <circle r="60" fill="#0A0B0A"/>
        <circle r="48" fill="none" stroke="#262B28" strokeWidth="1"/>
        <circle r="30" fill="#020302"/>
        <circle r="16" fill="#FFC107" opacity="0.9"/>
        <circle r="8" fill="#050606"/>
        <ellipse cx="-18" cy="-18" rx="10" ry="6" fill="#F5F7F5" opacity="0.5"/>
        <circle r="115" fill="none" stroke="#FFC107" strokeWidth="1" opacity="0.3" strokeDasharray="2 4">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite"/>
        </circle>
        <circle r="135" fill="none" stroke="#FFC107" strokeWidth="0.5" opacity="0.2"/>
      </g>
      {/* HUD elements */}
      <g transform="translate(30, 30)">
        <rect width="130" height="32" rx="4" fill="#0F1114" stroke="#262B28" strokeWidth="1"/>
        <circle cx="14" cy="16" r="4" fill="#FFC107">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <text x="26" y="20" fontFamily="ui-monospace, monospace" fontSize="10" fill="#FFC107" letterSpacing="1.5">REC · LIVE</text>
      </g>
      <g transform="translate(340, 30)">
        <rect width="130" height="32" rx="4" fill="#0F1114" stroke="#262B28" strokeWidth="1"/>
        <text x="10" y="14" fontFamily="ui-monospace, monospace" fontSize="8" fill="#6A7A6F" letterSpacing="1">4K · AI DETECT</text>
        <text x="10" y="26" fontFamily="ui-monospace, monospace" fontSize="10" fontWeight="600" fill="#F5F7F5">99.7% UPTIME</text>
      </g>
      {/* detection boxes */}
      <g transform="translate(60, 460)">
        <rect width="100" height="110" fill="none" stroke="#FFC107" strokeWidth="1.5" strokeDasharray="6 3"/>
        <line x1="0" y1="0" x2="8" y2="0" stroke="#FFC107" strokeWidth="2.5"/>
        <line x1="0" y1="0" x2="0" y2="8" stroke="#FFC107" strokeWidth="2.5"/>
        <line x1="92" y1="110" x2="100" y2="110" stroke="#FFC107" strokeWidth="2.5"/>
        <line x1="100" y1="102" x2="100" y2="110" stroke="#FFC107" strokeWidth="2.5"/>
        <text x="0" y="-6" fontFamily="ui-monospace, monospace" fontSize="9" fill="#FFC107">PERSON · 98%</text>
      </g>
      <g transform="translate(310, 490)">
        <rect width="140" height="80" fill="none" stroke="#F5F7F5" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
        <text x="0" y="-6" fontFamily="ui-monospace, monospace" fontSize="9" fill="#F5F7F5" opacity="0.7">TRACKING</text>
      </g>
      {/* bottom bar */}
      <g transform="translate(30, 590)">
        <text fontFamily="ui-monospace, monospace" fontSize="10" fill="#6A7A6F" letterSpacing="1.5">CAM-01 · AREQUIPA HQ</text>
        <text x="440" textAnchor="end" fontFamily="ui-monospace, monospace" fontSize="10" fill="#6A7A6F" letterSpacing="1.5">18:42:07</text>
      </g>
    </svg>
  );
}

// RSC — Isometric solar panel array SVG, 1:1 port from visuals.jsx

export default function HeroPanel() {
  return (
    <svg viewBox="0 0 800 600" aria-hidden="true">
      <defs>
        <linearGradient id="p-surface" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#2B3A5C"/>
          <stop offset="0.5" stopColor="#1A2540"/>
          <stop offset="1" stopColor="#0E1628"/>
        </linearGradient>
        <linearGradient id="p-reflect" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#FFE6A8" stopOpacity="0"/>
          <stop offset="0.5" stopColor="#FFE6A8" stopOpacity="0.65"/>
          <stop offset="1" stopColor="#FFE6A8" stopOpacity="0"/>
        </linearGradient>
        <pattern id="cells" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="none"/>
          <rect x="4" y="4" width="72" height="72" fill="none" stroke="#4A5D82" strokeWidth="1" opacity="0.6"/>
          <line x1="40" y1="4" x2="40" y2="76" stroke="#4A5D82" strokeWidth="0.5" opacity="0.4"/>
          <line x1="4" y1="40" x2="76" y2="40" stroke="#4A5D82" strokeWidth="0.5" opacity="0.4"/>
        </pattern>
      </defs>
      {/* panel 1 - back row */}
      <g transform="translate(40, 100)">
        <rect x="0" y="0" width="720" height="180" rx="4" fill="url(#p-surface)"/>
        <rect x="0" y="0" width="720" height="180" rx="4" fill="url(#cells)"/>
        <rect x="0" y="0" width="720" height="180" rx="4" fill="url(#p-reflect)" opacity="0.6"/>
        <line x1="180" y1="0" x2="180" y2="180" stroke="#0A1220" strokeWidth="2"/>
        <line x1="360" y1="0" x2="360" y2="180" stroke="#0A1220" strokeWidth="2"/>
        <line x1="540" y1="0" x2="540" y2="180" stroke="#0A1220" strokeWidth="2"/>
      </g>
      {/* panel 2 - front row */}
      <g transform="translate(10, 310)">
        <rect x="0" y="0" width="780" height="200" rx="4" fill="url(#p-surface)"/>
        <rect x="0" y="0" width="780" height="200" rx="4" fill="url(#cells)"/>
        <rect x="0" y="0" width="780" height="200" rx="4" fill="url(#p-reflect)" opacity="0.7"/>
        <line x1="195" y1="0" x2="195" y2="200" stroke="#0A1220" strokeWidth="2"/>
        <line x1="390" y1="0" x2="390" y2="200" stroke="#0A1220" strokeWidth="2"/>
        <line x1="585" y1="0" x2="585" y2="200" stroke="#0A1220" strokeWidth="2"/>
      </g>
      {/* frame highlights */}
      <rect x="40" y="100" width="720" height="180" rx="4" fill="none" stroke="#6A7FA8" strokeWidth="1" opacity="0.4"/>
      <rect x="10" y="310" width="780" height="200" rx="4" fill="none" stroke="#6A7FA8" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

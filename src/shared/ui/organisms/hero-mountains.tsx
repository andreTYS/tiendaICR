// RSC — SVG mountain silhouette (Misti + Chachani + Pichu Pichu), 1:1 port from visuals.jsx

export default function HeroMountains() {
  return (
    <svg viewBox="0 0 1600 500" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="m-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#A9D4E8" stopOpacity="0"/>
          <stop offset="0.4" stopColor="#6FB3D2" stopOpacity="0.2"/>
          <stop offset="1" stopColor="#0A0A0A" stopOpacity="0.95"/>
        </linearGradient>
        <linearGradient id="m-far" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5B7E94"/>
          <stop offset="1" stopColor="#1F2A36"/>
        </linearGradient>
        <linearGradient id="m-mid" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2D3A48"/>
          <stop offset="1" stopColor="#121820"/>
        </linearGradient>
        <linearGradient id="m-near" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0E1218"/>
          <stop offset="1" stopColor="#050607"/>
        </linearGradient>
      </defs>
      {/* sky wash */}
      <rect width="1600" height="500" fill="url(#m-sky)"/>
      {/* far range (Chachani) */}
      <path fill="url(#m-far)" d="M0,280 L110,230 L180,245 L240,200 L310,165 L360,140 L420,155 L470,120 L540,95 L610,125 L680,100 L740,130 L820,80 L910,115 L980,95 L1070,140 L1160,115 L1240,160 L1330,135 L1420,180 L1510,160 L1600,195 L1600,500 L0,500 Z"/>
      {/* midrange (Misti) */}
      <path fill="url(#m-mid)" d="M0,350 L90,325 L170,340 L240,310 L310,290 L380,320 L450,295 L520,325 L600,280 L680,310 L760,290 L850,320 L940,255 L1020,210 L1080,170 L1130,120 L1180,175 L1230,220 L1280,260 L1360,300 L1440,320 L1520,305 L1600,330 L1600,500 L0,500 Z"/>
      {/* snow caps on Misti */}
      <path fill="#F5F0E8" opacity="0.85" d="M1130,120 L1140,135 L1150,128 L1162,145 L1178,130 L1180,175 L1155,165 L1140,175 L1122,150 Z"/>
      <path fill="#E8E4DC" opacity="0.55" d="M1020,210 L1040,225 L1060,215 L1080,230 L1090,215 L1095,240 L1055,250 L1030,240 Z"/>
      {/* near foothills */}
      <path fill="url(#m-near)" d="M0,420 L80,400 L150,415 L220,395 L300,410 L380,385 L460,405 L550,390 L640,410 L730,395 L820,415 L900,400 L980,420 L1080,390 L1180,415 L1280,400 L1380,420 L1480,405 L1600,425 L1600,500 L0,500 Z"/>
    </svg>
  );
}

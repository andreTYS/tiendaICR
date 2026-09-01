// RSC — Abstract per-project SVG visual
// 1:1 port from visuals.jsx#ProjectVisual — Math.random replaced with seeded rng

function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * Round to 3 decimals — mandatory for every SVG numeric attribute that
 * comes from a float computation. React 19 compares server-rendered and
 * client-rendered values with full precision, and V8 on Node vs. the
 * browser can disagree on the last digit, triggering a hydration
 * mismatch that discards the whole subtree and blanks the page.
 */
const r3 = (n: number): number => Math.round(n * 1000) / 1000;

interface Props {
  palette: readonly [string, string, string];
  index: number;
}

export default function ProjectVisual({ palette, index }: Props) {
  const [c1, c2, c3] = palette;
  const rng = makeRng(index * 31337 + 1);

  const stars40 = Array.from({ length: 40 }, () => ({
    cx: r3(rng() * 600),
    cy: r3(rng() * 200),
    r: r3(rng() * 1.2),
    opacity: r3(rng() * 0.8),
  }));
  const stars20 = Array.from({ length: 20 }, () => ({
    cx: r3(rng() * 600),
    cy: r3(rng() * 150),
    r: r3(rng()),
    opacity: r3(rng() * 0.7),
  }));

  const variants = [
    // 0 — Mining: mountain silhouette + solar array
    <svg key="a" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`pv${index}-a`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c3} />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill={`url(#pv${index}-a)`} />
      <path
        d="M0,260 L80,200 L140,220 L220,150 L300,90 L380,140 L460,180 L540,160 L600,190 L600,400 L0,400 Z"
        fill={c3}
        opacity="0.7"
      />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${40 + i * 140}, 290)`}>
          <rect width="110" height="70" fill="#0F1A2E" stroke={c2} strokeWidth="1.5" opacity="0.9" />
          <line x1="55" y1="0" x2="55" y2="70" stroke={c2} strokeWidth="0.5" opacity="0.5" />
          <line x1="0" y1="35" x2="110" y2="35" stroke={c2} strokeWidth="0.5" opacity="0.5" />
        </g>
      ))}
      <circle cx="480" cy="100" r="45" fill="#FFE6A8" opacity="0.85" />
      <circle cx="480" cy="100" r="70" fill="#FFE6A8" opacity="0.15" />
    </svg>,

    // 1 — Agro: green fields
    <svg key="b" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`pv${index}-b`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={c2} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill={`url(#pv${index}-b)`} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={i * 100} y={200} width="100" height="200" fill={c3} opacity={r3(0.15 + i * 0.08)} />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1="0" y1={220 + i * 28} x2="600" y2={220 + i * 28} stroke="#FFC107" strokeWidth="1" opacity="0.4" />
      ))}
      <circle cx="120" cy="110" r="55" fill="#FFE6A8" opacity="0.7" />
    </svg>,

    // 2 — Municipal: lamp posts at night
    <svg key="c" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`pv${index}-c`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={c3} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
        <radialGradient id={`pv${index}-light`}>
          <stop offset="0" stopColor={c2} stopOpacity="0.9" />
          <stop offset="1" stopColor={c2} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="400" fill={`url(#pv${index}-c)`} />
      {stars40.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#F5F7F5" opacity={s.opacity} />
      ))}
      {[100, 260, 420].map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy={140} rx="80" ry="60" fill={`url(#pv${index}-light)`} />
          <rect x={x - 2} y={140} width="4" height="220" fill="#0F172A" />
          <rect x={x - 16} y={130} width="32" height="14" rx="2" fill="#0F172A" />
          <circle cx={x} cy={138} r="6" fill={c2} />
        </g>
      ))}
      <rect x="0" y="360" width="600" height="40" fill="#0F172A" />
    </svg>,

    // 3 — Hotel: warm glow
    <svg key="d" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`pv${index}-d`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={c2} />
          <stop offset="0.7" stopColor={c1} />
          <stop offset="1" stopColor={c3} />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill={`url(#pv${index}-d)`} />
      <path
        d="M0,280 L80,220 L160,240 L240,180 L340,140 L440,190 L520,170 L600,210 L600,400 L0,400 Z"
        fill={c3}
        opacity="0.8"
      />
      <g transform="translate(200, 260)">
        <rect width="200" height="100" fill="#1C1917" />
        <polygon points="0,0 100,-40 200,0" fill="#1C1917" />
        <rect x="-30" y="10" width="60" height="80" fill="#1C1917" />
        <rect x="200" y="10" width="60" height="80" fill="#1C1917" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <rect key={`${r}-${c}`} x={20 + c * 45} y={20 + r * 28} width="24" height="16" fill={c2} opacity="0.7" />
          ))
        )}
      </g>
    </svg>,

    // 4 — Home: modern house
    <svg key="e" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`pv${index}-e`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={c3} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill={`url(#pv${index}-e)`} />
      {stars20.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#F5F7F5" opacity={s.opacity} />
      ))}
      <g transform="translate(120, 190)">
        <polygon points="0,30 180,0 360,30 360,60 180,30 0,60" fill="#0F172A" />
        <rect x="20" y="60" width="320" height="130" fill="#111827" />
        <rect x="40" y="80" width="80" height="90" fill={c2} opacity="0.7" />
        <rect x="140" y="80" width="30" height="90" fill={c2} opacity="0.5" />
        <rect x="200" y="80" width="110" height="60" fill={c2} opacity="0.8" />
      </g>
      <rect x="0" y="380" width="600" height="20" fill="#0F172A" />
    </svg>,
  ];

  return variants[index % variants.length];
}

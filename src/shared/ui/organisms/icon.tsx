// RSC — SVG icon set, 1:1 port from visuals.jsx

export type IconName =
  | 'arrow' | 'camera' | 'lock' | 'monitor' | 'bolt'
  | 'home' | 'building' | 'factory' | 'phone' | 'mail'
  | 'pin' | 'whatsapp';

interface IconProps {
  name: IconName;
  size?: number;
}

const paths: Record<IconName, React.ReactNode> = {
  arrow: (
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  ),
  camera: (
    <>
      <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 6l2-2h4l2 2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M9 22h6M12 18v4" stroke="currentColor" strokeWidth="1.5"/>
    </>
  ),
  bolt: (
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
  ),
  home: (
    <path d="M3 12l9-9 9 9v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  ),
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" stroke="currentColor" strokeWidth="2"/>
    </>
  ),
  factory: (
    <path d="M3 21V10l5 3V10l5 3V7l8 5v9H3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.5a16 16 0 006 6l1.1-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M2 7l10 6 10-6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </>
  ),
  whatsapp: (
    <path d="M12 2a10 10 0 00-8.5 15.3L2 22l4.8-1.3A10 10 0 1012 2zm5.5 14c-.3.7-1.4 1.3-2 1.4-.6.1-1.2.2-3.8-.8-3.2-1.2-5.2-4.5-5.4-4.7-.1-.2-1.2-1.6-1.2-3s.8-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .5 0 .7.6l1 2.3c.1.2.1.4 0 .6l-.3.4-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.2.1 1.6.8 1.9.9.3.1.5.2.5.3.1.2.1.8-.2 1.5z" fill="currentColor"/>
  ),
};

export default function Icon({ name, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

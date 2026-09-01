'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/modules/auth/domain/user-role';

interface Props {
  role: Role;
}

const NAV_ITEMS = [
  { href: '/admin',             label: 'Dashboard',  icon: 'grid',       section: 'main' },
  { href: '/admin/banners',     label: 'Banners',    icon: 'image',      section: 'content' },
  { href: '/admin/proyectos',   label: 'Proyectos',  icon: 'folder',     section: 'content' },
  { href: '/admin/categorias',  label: 'Categorías', icon: 'tag',        section: 'content' },
  { href: '/admin/mensajes',    label: 'Mensajes',   icon: 'mail',       section: 'content' },
  { href: '/admin/contacto',    label: 'Contacto y redes', icon: 'phone', section: 'content' },
  { href: '/admin/settings',    label: 'Configuración', icon: 'cog',     section: 'system', adminOnly: true },
] as const;

const SECTION_LABELS: Record<string, string> = {
  main: 'Principal',
  content: 'Contenido',
  system: 'Sistema',
};

export default function AdminSidebar({ role }: Props) {
  const pathname = usePathname() ?? '/admin';

  const visible = NAV_ITEMS.filter(
    (item) => !('adminOnly' in item && item.adminOnly) || role === 'ADMIN',
  );

  const grouped = visible.reduce<Record<string, typeof visible>>((acc, item) => {
    (acc[item.section] ||= []).push(item);
    return acc;
  }, {});

  const isActive = (href: string): boolean => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-sidebar-brand" prefetch={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo-dark-trim.png" alt="Inversiones ICR" />
        <span className="admin-sidebar-brand-tag">Admin</span>
      </Link>

      <nav className="admin-sidebar-nav" aria-label="Navegación administrativa">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} className="admin-sidebar-group">
            <h6 className="admin-sidebar-group-title">{SECTION_LABELS[section]}</h6>
            <ul>
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className={`admin-sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-foot">
        <Link href="/" prefetch={false} className="admin-sidebar-back">
          <Icon name="external" />
          <span>Ver sitio público</span>
        </Link>
      </div>
    </aside>
  );
}

function Icon({ name }: { name: string }) {
  const p = 'currentColor';
  switch (name) {
    case 'grid':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case 'image':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    case 'folder':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      );
    case 'tag':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
    case 'mail':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case 'phone':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'cog':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.36.17.66.4.89.68.22.28.38.61.47.96" />
        </svg>
      );
    case 'external':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
    default:
      return null;
  }
}

import type { ReactNode } from 'react';
import '../admin/admin.css';

/**
 * Client portal layout — reuses the admin design tokens for a consistent
 * dashboard feel but does NOT mount the admin sidebar/topbar (CLIENT users
 * never see the admin nav). Auth is enforced by `proxy.ts`.
 */
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Portal del cliente | Inversiones ICR' };

export default function ClientPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ad-bg)', color: 'var(--ad-text)' }}>
      {children}
    </div>
  );
}

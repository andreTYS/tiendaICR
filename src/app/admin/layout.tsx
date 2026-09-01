// Admin pages always read from the DB — never prerender at build time.
export const dynamic = 'force-dynamic';

import type { ReactNode } from 'react';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import AdminSidebar from './_components/admin-sidebar';
import AdminTopbar from './_components/admin-topbar';
import './admin.css';

/**
 * Admin layout.
 *
 * Two render modes:
 *  - Unauthenticated requests (e.g. /admin/login) bypass the shell and
 *    render children directly. The proxy already redirects logged-out
 *    users on protected paths to /admin/login, so the only unauthenticated
 *    content we serve here IS the login page.
 *  - Authenticated requests get the full shell: sticky sidebar + topbar +
 *    content area. Session is fetched once here and the user info is passed
 *    to the topbar; the sidebar only needs the role to hide ADMIN-only
 *    entries (Settings).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.user;

  const hdrs = await headers();
  const pathname = hdrs.get('x-invoke-path') ?? hdrs.get('x-pathname') ?? '';
  const isLoginRoute = pathname.endsWith('/admin/login');

  if (!user || isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar role={user.role} />
      <div className="admin-main">
        <AdminTopbar user={{ email: user.email ?? '', role: user.role }} />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}

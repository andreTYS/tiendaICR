import { signOutAction } from '@/app/actions/auth';

interface Props {
  user: { email: string; role: string };
}

/**
 * Server Component — reads the session from the parent layout and shows
 * the current user's email + role badge + sign-out form.
 */
export default function AdminTopbar({ user }: Props) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-spacer" />
      <div className="admin-topbar-user">
        <div className="admin-topbar-user-info">
          <span className="admin-topbar-email">{user.email}</span>
          <span className={`admin-topbar-role role-${user.role.toLowerCase()}`}>{user.role}</span>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="admin-topbar-signout" aria-label="Cerrar sesión">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Salir</span>
          </button>
        </form>
      </div>
    </header>
  );
}

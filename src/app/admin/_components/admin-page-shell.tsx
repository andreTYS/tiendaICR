import type { ReactNode } from 'react';

interface Props {
  /** Page title — single source of truth for the H1. */
  title: string;
  /** Optional short description shown below the title. */
  description?: string;
  /** Optional right-aligned actions (e.g. "New banner" button). */
  actions?: ReactNode;
  /** Optional breadcrumbs above the header. */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  children: ReactNode;
}

/**
 * Template for every admin page. Gives a consistent header (breadcrumbs,
 * title, description, actions) and a content area with standard padding.
 * Use inside any /admin/** page after the auth guard has run.
 */
export default function AdminPageShell({
  title,
  description,
  actions,
  breadcrumbs,
  children,
}: Props) {
  return (
    <div className="admin-page">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="admin-page-crumbs" aria-label="Breadcrumbs">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="admin-page-crumb">
              {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
              {i < breadcrumbs.length - 1 && <span className="admin-page-crumb-sep">/</span>}
            </span>
          ))}
        </nav>
      )}

      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          {description && <p className="admin-page-description">{description}</p>}
        </div>
        {actions && <div className="admin-page-actions">{actions}</div>}
      </header>

      <div className="admin-page-body">{children}</div>
    </div>
  );
}

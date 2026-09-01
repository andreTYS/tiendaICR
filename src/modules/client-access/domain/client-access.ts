/**
 * ClientAccess — grants a CLIENT user read-only access to a project's
 * energy data through /cliente. Many-to-many between User and Project.
 */
export interface ClientAccess {
  id: string;
  userId: string;
  projectId: string;
  createdAt: Date;
}

export interface ClientAccessWithUser extends ClientAccess {
  user: { id: string; email: string };
}

export interface ClientAccessWithProject extends ClientAccess {
  project: { id: string; slug: string; titleEs: string; mainImageKey: string };
}

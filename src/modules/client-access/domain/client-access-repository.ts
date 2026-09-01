import type {
  ClientAccess,
  ClientAccessWithProject,
  ClientAccessWithUser,
} from "./client-access";

export interface ClientAccessRepository {
  /** All accesses granted for a given project (used by the admin UI). */
  listByProject(projectId: string): Promise<ClientAccessWithUser[]>;
  /** All projects a given client user can read (used by /cliente). */
  listByUser(userId: string): Promise<ClientAccessWithProject[]>;
  /** True if the user has read access to that project. */
  has(userId: string, projectId: string): Promise<boolean>;
  grant(userId: string, projectId: string): Promise<ClientAccess>;
  revoke(id: string): Promise<void>;
}

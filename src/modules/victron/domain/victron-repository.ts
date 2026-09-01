import type { VictronSite } from "./victron-site";
import type { VictronConfigState } from "./victron-config";
import type { VictronSnapshot } from "./victron-snapshot";

export interface VictronConfigRepository {
  /** Always returns a row (upserts with empty defaults if missing). */
  getState(): Promise<VictronConfigState>;
  /** Returns the decrypted token, or null if not configured. */
  getDecryptedToken(): Promise<string | null>;
  /** Stores token encrypted + records the identity returned by /users/me. */
  saveToken(input: {
    token: string;
    identity: { id: number; name: string; email: string } | null;
    testOk: boolean;
  }): Promise<VictronConfigState>;
  clearToken(): Promise<VictronConfigState>;
}

export interface VictronSiteRepository {
  findByProjectId(projectId: string): Promise<VictronSite | null>;
  findByIdSite(idSite: number): Promise<VictronSite | null>;
  link(input: {
    projectId: string;
    idSite: number;
    displayName?: string | null;
  }): Promise<VictronSite>;
  update(
    projectId: string,
    patch: Partial<Pick<VictronSite,
      | "displayName"
      | "isPublicMetrics"
      | "showPv"
      | "showBattery"
      | "showLoad"
      | "showGrid"
    >>,
  ): Promise<VictronSite>;
  unlink(projectId: string): Promise<void>;
  saveSnapshot(projectId: string, snapshot: VictronSnapshot): Promise<void>;
}

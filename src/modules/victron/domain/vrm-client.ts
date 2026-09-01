import type { VictronInstallationSummary } from "./victron-site";
import type { VictronSnapshot } from "./victron-snapshot";

export interface VrmUserIdentity {
  id: number;
  name: string;
  email: string;
}

export interface VrmClient {
  /** Probe the token by calling /users/me. Returns identity or throws. */
  whoami(token: string): Promise<VrmUserIdentity>;
  /** List the installations the token's owner has access to. */
  listInstallations(token: string, userId: number): Promise<VictronInstallationSummary[]>;
  /** Build a normalised snapshot for a single installation. */
  fetchSnapshot(token: string, idSite: number, displayName: string | null): Promise<VictronSnapshot>;
}

/**
 * VictronSite — bridge between a Project (CMS entity) and a Victron VRM
 * installation (idSite). Holds visibility toggles for the public widget
 * and an opaque last-snapshot cache to avoid hammering the VRM API.
 */
export interface VictronSite {
  id: string;
  projectId: string;
  idSite: number;
  displayName: string | null;
  isPublicMetrics: boolean;
  showPv: boolean;
  showBattery: boolean;
  showLoad: boolean;
  showGrid: boolean;
  lastSyncAt: Date | null;
  lastSnapshot: unknown | null;
  createdAt: Date;
  updatedAt: Date;
}

/** VRM installation as returned by the VRM API, used by the linker UI. */
export interface VictronInstallationSummary {
  idSite: number;
  name: string;
  identifier: string;
  timezone: string | null;
  hasGenerator: boolean;
  hasMains: boolean;
}

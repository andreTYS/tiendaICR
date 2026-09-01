/**
 * Cached snapshot read.
 *
 * Decision: cache lives in the VictronSite row (`lastSnapshot` + `lastSyncAt`)
 * so it survives restarts and is shared across server instances behind a
 * load balancer. TTL = 120 s per the user requirement.
 *
 * The function returns a snapshot in three cases:
 *   1. Fresh cache exists (< TTL) → return it.
 *   2. Cache stale and VRM call succeeds → refresh, persist, return.
 *   3. Cache stale and VRM call fails → return the stale cache anyway
 *      (better than a broken widget on the public page).
 */
import { ok, err, type Result } from "@/shared/lib/result";
import type { VictronSiteRepository, VictronConfigRepository } from "../domain/victron-repository";
import type { VrmClient } from "../domain/vrm-client";
import type { VictronSnapshot } from "../domain/victron-snapshot";
import { EMPTY_SNAPSHOT } from "../domain/victron-snapshot";
import type { VictronError } from "../domain/victron-errors";

export const SNAPSHOT_TTL_MS = 120_000;

export interface GetSnapshotDeps {
  siteRepo: VictronSiteRepository;
  configRepo: VictronConfigRepository;
  vrm: VrmClient;
}

export interface SnapshotEnvelope {
  snapshot: VictronSnapshot;
  /** True when this snapshot was just refreshed from VRM. */
  fresh: boolean;
  /** When the data was actually fetched from VRM (epoch ms). */
  fetchedAt: number;
}

export async function getPublicSnapshot(
  input: { projectId: string },
  deps: GetSnapshotDeps,
): Promise<Result<SnapshotEnvelope, VictronError>> {
  const site = await deps.siteRepo.findByProjectId(input.projectId);
  if (!site) return err("SITE_NOT_FOUND");
  if (!site.isPublicMetrics) return err("UNAUTHORIZED");
  return readWithCache(site, deps);
}

export async function getProtectedSnapshot(
  input: { projectId: string },
  deps: GetSnapshotDeps,
): Promise<Result<SnapshotEnvelope, VictronError>> {
  const site = await deps.siteRepo.findByProjectId(input.projectId);
  if (!site) return err("SITE_NOT_FOUND");
  return readWithCache(site, deps);
}

async function readWithCache(
  site: Awaited<ReturnType<VictronSiteRepository["findByProjectId"]>> & {},
  deps: GetSnapshotDeps,
): Promise<Result<SnapshotEnvelope, VictronError>> {
  const now = Date.now();
  const lastTs = site.lastSyncAt ? site.lastSyncAt.getTime() : 0;
  const fresh = site.lastSnapshot && now - lastTs < SNAPSHOT_TTL_MS;

  if (fresh && site.lastSnapshot) {
    return ok({
      snapshot: site.lastSnapshot as VictronSnapshot,
      fresh: false,
      fetchedAt: lastTs,
    });
  }

  const token = await deps.configRepo.getDecryptedToken();
  if (!token) {
    // Fall back to whatever stale data we have so the UI doesn't go blank.
    if (site.lastSnapshot) {
      return ok({
        snapshot: site.lastSnapshot as VictronSnapshot,
        fresh: false,
        fetchedAt: lastTs,
      });
    }
    return err("TOKEN_NOT_CONFIGURED");
  }

  try {
    const snap = await deps.vrm.fetchSnapshot(token, site.idSite, site.displayName);
    await deps.siteRepo.saveSnapshot(site.projectId, snap);
    return ok({ snapshot: snap, fresh: true, fetchedAt: now });
  } catch {
    if (site.lastSnapshot) {
      return ok({
        snapshot: site.lastSnapshot as VictronSnapshot,
        fresh: false,
        fetchedAt: lastTs,
      });
    }
    // No data ever — return an empty shell so the UI can still render a
    // "sin datos" state instead of crashing.
    return ok({
      snapshot: EMPTY_SNAPSHOT(site.idSite, site.displayName),
      fresh: false,
      fetchedAt: now,
    });
  }
}

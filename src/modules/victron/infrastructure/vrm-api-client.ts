/**
 * Thin adapter over the public Victron VRM API.
 *
 * Endpoints used (v2):
 *   GET /users/me                                    → identity probe
 *   GET /users/{idUser}/installations?extended=1     → list sites
 *   GET /installations/{idSite}/system-overview      → device list + connection state
 *   GET /installations/{idSite}/stats?type=live_feed → latest sample per attribute
 *
 * Notes:
 *  - Auth header is `X-Authorization: Token <token>`. Bearer is NOT accepted.
 *  - `live_feed.records` is `{ code: [[tsMs, value, ...], ...] }` — tuples can
 *    be of varying length (e.g. bs is `[ts, mean, min, max]`). We always use
 *    index [0] (ts in milliseconds) and [1] (value).
 *  - `live_feed.totals` is a flat `{ code: value }` with whole-period sums
 *    (today's solar yield, consumption, etc.).
 *  - Online detection: VRM does not expose a single boolean. We treat the
 *    installation as online when ANY device's `lastConnection` is within the
 *    last 15 minutes.
 *  - Rate limit: callers must respect the application-layer 120 s cache TTL.
 */
import type { VrmClient, VrmUserIdentity } from "../domain/vrm-client";
import type { VictronInstallationSummary } from "../domain/victron-site";
import type { VictronSnapshot } from "../domain/victron-snapshot";

const BASE = "https://vrmapi.victronenergy.com/v2";
const REQUEST_TIMEOUT_MS = 15_000;
const ONLINE_WINDOW_S = 15 * 60;

function authHeader(token: string): HeadersInit {
  return { "X-Authorization": `Token ${token}` };
}

async function vrmGet<T>(path: string, token: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: authHeader(token),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new VrmApiError(`VRM ${res.status} on ${path}`, res.status);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export class VrmApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "VrmApiError";
  }
}

interface WhoamiResponse {
  success: boolean;
  user?: { id: number; name: string; email: string };
}

interface InstallationsResponse {
  success: boolean;
  records?: Array<{
    idSite: number;
    name: string;
    identifier: string;
    timezone: string | null;
    hasMains: number;
    hasGenerator: number;
  }>;
}

interface SystemOverviewResponse {
  success: boolean;
  records?: {
    devices?: Array<{ lastConnection?: number }>;
    [k: string]: unknown;
  };
}

/** Each value is an array of `[tsMs, value, ...maybeMore]` tuples. */
type LiveFeedSeries = Array<Array<number | null>>;
interface LiveFeedResponse {
  success: boolean;
  records?: Record<string, LiveFeedSeries>;
  totals?: Record<string, number | boolean | null>;
}

/** Returns the most-recent non-null numeric value from a live_feed series. */
function latestValue(series: LiveFeedSeries | undefined): {
  value: number | null;
  tsSeconds: number | null;
} {
  if (!series || series.length === 0) return { value: null, tsSeconds: null };
  for (let i = series.length - 1; i >= 0; i--) {
    const point = series[i];
    if (!point || point.length < 2) continue;
    const ts = point[0];
    const value = point[1];
    if (typeof value === "number" && Number.isFinite(value)) {
      return {
        value,
        tsSeconds: typeof ts === "number" ? Math.floor(ts / 1000) : null,
      };
    }
  }
  return { value: null, tsSeconds: null };
}

function numericTotal(totals: LiveFeedResponse["totals"], code: string): number | null {
  const v = totals?.[code];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function detectOnline(overview: SystemOverviewResponse | null): {
  isOnline: boolean;
  lastConn: number | null;
} {
  const devices = overview?.records?.devices ?? [];
  let latest: number | null = null;
  for (const d of devices) {
    if (typeof d.lastConnection === "number") {
      if (latest === null || d.lastConnection > latest) latest = d.lastConnection;
    }
  }
  if (latest === null) return { isOnline: false, lastConn: null };
  const ageS = Date.now() / 1000 - latest;
  return { isOnline: ageS < ONLINE_WINDOW_S, lastConn: latest };
}

export const vrmApiClient: VrmClient = {
  async whoami(token: string): Promise<VrmUserIdentity> {
    const res = await vrmGet<WhoamiResponse>("/users/me", token);
    if (!res.success || !res.user) {
      throw new VrmApiError("Token rejected by VRM /users/me");
    }
    return { id: res.user.id, name: res.user.name, email: res.user.email };
  },

  async listInstallations(token, userId) {
    const res = await vrmGet<InstallationsResponse>(
      `/users/${userId}/installations?extended=1`,
      token,
    );
    if (!res.success || !res.records) return [];
    return res.records.map((r) => ({
      idSite: r.idSite,
      name: r.name,
      identifier: r.identifier,
      timezone: r.timezone,
      hasMains: Boolean(r.hasMains),
      hasGenerator: Boolean(r.hasGenerator),
    }));
  },

  async fetchSnapshot(token, idSite, displayName) {
    const [live, overview] = await Promise.all([
      vrmGet<LiveFeedResponse>(`/installations/${idSite}/stats?type=live_feed`, token).catch(
        () => null,
      ),
      vrmGet<SystemOverviewResponse>(`/installations/${idSite}/system-overview`, token).catch(
        () => null,
      ),
    ]);

    const series = live?.records ?? {};
    const totals = live?.totals;

    // Instant readings from the latest live_feed sample for each code.
    const pv = latestValue(series.Pdc); // PV power (W)
    const bs = latestValue(series.bs); // battery SoC (%)
    const bv = latestValue(series.bv); // battery voltage (V)
    const bp = latestValue(series.Bp); // battery power (W) — when present
    const load = latestValue(series.cl); // AC consumption (W)
    const grid = latestValue(series.gn); // grid power (W)
    const genset = latestValue(series.gnp); // generator (W)

    const onlineInfo = detectOnline(overview);

    // Best timestamp wins — prefer the freshest numeric point.
    const candidateTs = [
      pv.tsSeconds,
      bs.tsSeconds,
      bv.tsSeconds,
      bp.tsSeconds,
      load.tsSeconds,
      grid.tsSeconds,
      genset.tsSeconds,
      onlineInfo.lastConn,
    ].filter((t): t is number => typeof t === "number");
    const lastUpdate = candidateTs.length ? Math.max(...candidateTs) : null;

    return {
      lastUpdate,
      isOnline: onlineInfo.isOnline,
      pvPowerW: pv.value,
      batteryPowerW: bp.value,
      loadPowerW: load.value,
      gridPowerW: grid.value,
      generatorPowerW: genset.value,
      batterySoc: bs.value,
      batteryVoltageV: bv.value,
      pvYieldTodayKwh: numericTotal(totals, "total_solar_yield"),
      consumptionTodayKwh: numericTotal(totals, "total_consumption"),
      gridFromTodayKwh: numericTotal(totals, "grid_history_from"),
      gridToTodayKwh: numericTotal(totals, "grid_history_to"),
      idSite,
      displayName,
    } satisfies VictronSnapshot;
  },
};

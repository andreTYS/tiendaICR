'use client';

import { useEffect, useState } from 'react';
import type { VictronSnapshot } from '../../domain/victron-snapshot';

interface Props {
  /** Project slug — backend resolves the linked VictronSite. */
  slug: string;
  /** Where to fetch from. `public` is no-auth + isPublicMetrics gate;
   *  `client` is auth + ClientAccess gate. */
  source: 'public' | 'client';
  /** Refresh interval in ms. Defaults to 120 s to match the server-side TTL. */
  refreshMs?: number;
}

interface ApiResponse {
  snapshot: VictronSnapshot;
  fresh: boolean;
  fetchedAt: number;
  visibility: {
    showPv: boolean;
    showBattery: boolean;
    showLoad: boolean;
    showGrid: boolean;
  } | null;
}

export default function LiveEnergyWidget({ slug, source, refreshMs = 120_000 }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const url = `/api/victron/${source}/${slug}/snapshot`;

    async function load() {
      try {
        const res = await fetch(url, { credentials: 'same-origin' });
        if (!res.ok) {
          if (!cancelled) {
            setError(res.status === 404 ? 'no-data' : 'error');
            setLoading(false);
          }
          return;
        }
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) {
          setData(json);
          setError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('error');
          setLoading(false);
        }
      }
    }

    void load();
    const id = setInterval(load, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [slug, source, refreshMs]);

  if (loading) {
    return (
      <div className="live-energy-card live-energy-card--loading" aria-live="polite">
        Cargando datos de energía…
      </div>
    );
  }

  if (error || !data) return null; // Silent hide on failure / not configured

  return <SnapshotView data={data} />;
}

function SnapshotView({ data }: { data: ApiResponse }) {
  const s = data.snapshot;
  const v = data.visibility;
  const showPv = v?.showPv ?? true;
  const showBattery = v?.showBattery ?? true;
  const showLoad = v?.showLoad ?? true;
  const showGrid = v?.showGrid ?? false;

  const updated = s.lastUpdate ? new Date(s.lastUpdate * 1000) : null;

  return (
    <section className="live-energy" aria-label="Energía en tiempo real">
      <header className="live-energy-header">
        <div>
          <span className="live-energy-eyebrow">Energía en tiempo real</span>
          <h2 className="live-energy-title">
            {s.displayName ?? 'Instalación Victron'}
          </h2>
        </div>
        <div className="live-energy-status">
          <span
            className={`live-energy-dot ${s.isOnline ? 'is-online' : 'is-offline'}`}
            aria-hidden="true"
          />
          <span className="live-energy-status-text">
            {s.isOnline ? 'En línea' : 'Sin conexión'}
          </span>
          {updated && (
            <span className="live-energy-updated">
              Actualizado: {updated.toLocaleTimeString('es-PE')}
            </span>
          )}
        </div>
      </header>

      <div className="live-energy-grid">
        {showPv && (
          <Stat
            label="Producción solar"
            value={formatPower(s.pvPowerW)}
            accent="solar"
          />
        )}
        {showBattery && (
          <Stat
            label="Batería"
            value={s.batterySoc != null ? `${Math.round(s.batterySoc)}%` : '—'}
            sub={
              s.batteryPowerW != null
                ? s.batteryPowerW >= 0
                  ? `cargando ${formatPower(s.batteryPowerW)}`
                  : `descargando ${formatPower(Math.abs(s.batteryPowerW))}`
                : undefined
            }
            accent="battery"
          />
        )}
        {showLoad && (
          <Stat label="Consumo" value={formatPower(s.loadPowerW)} accent="load" />
        )}
        {showGrid && (
          <Stat label="Red" value={formatPower(s.gridPowerW)} accent="grid" />
        )}
      </div>

      <footer className="live-energy-footer">
        <small>Fuente: Victron VRM · datos cada 2 minutos</small>
      </footer>
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: 'solar' | 'battery' | 'load' | 'grid';
}) {
  return (
    <div className={`live-energy-stat live-energy-stat--${accent}`}>
      <div className="live-energy-stat-label">{label}</div>
      <div className="live-energy-stat-value">{value}</div>
      {sub && <div className="live-energy-stat-sub">{sub}</div>}
    </div>
  );
}

function formatPower(w: number | null | undefined): string {
  if (w == null || Number.isNaN(w)) return '—';
  const abs = Math.abs(w);
  if (abs >= 1000) return `${(w / 1000).toFixed(2)} kW`;
  return `${Math.round(w)} W`;
}

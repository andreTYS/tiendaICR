'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import type { VictronSite } from '../../domain/victron-site';
import {
  linkVictronSiteAction,
  updateVictronSiteAction,
  unlinkVictronSiteAction,
  getVrmInstallationsAction,
  type InstallationOption,
} from '@/app/actions/victron';

interface Props {
  projectId: string;
  /** Existing link, if any. */
  site: VictronSite | null;
  /** True when an admin token is saved — drives whether the linker is usable. */
  tokenConfigured: boolean;
}

type LinkState = { error?: string; ok?: true; message?: string } | null;

export default function VictronSitePanel({ projectId, site, tokenConfigured }: Props) {
  if (!tokenConfigured) {
    return (
      <div
        style={{
          padding: 14,
          borderRadius: 8,
          border: '1px dashed var(--ad-border)',
          color: 'var(--ad-text-dim)',
          fontSize: 13,
        }}
      >
        Configura primero el token VRM en{' '}
        <a href="/admin/settings" style={{ color: 'var(--ad-accent)' }}>
          Configuración
        </a>{' '}
        para poder vincular este proyecto a una instalación Victron.
      </div>
    );
  }

  return site ? (
    <LinkedView projectId={projectId} site={site} />
  ) : (
    <Linker projectId={projectId} />
  );
}

// ────────────────────────────────────────────────────────────────────────
// Linker — pick an installation from VRM and bind it to the project.

function Linker({ projectId }: { projectId: string }) {
  const [opts, setOpts] = useState<InstallationOption[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const boundAction = linkVictronSiteAction.bind(null, projectId);
  const [state, action, pending] = useActionState<LinkState, FormData>(boundAction, null);

  useEffect(() => {
    let cancelled = false;
    getVrmInstallationsAction().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setOpts(res.installations);
      } else {
        setLoadError(res.error ?? 'No se pudo cargar la lista.');
        setOpts([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <form action={action}>
      {state?.error && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 12 }}>
          {state.error}
        </div>
      )}
      {loadError && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 12 }}>
          {loadError}
        </div>
      )}

      <div className="admin-field">
        <label className="admin-field-label" htmlFor="vs-idSite">
          Instalación Victron
        </label>
        {opts === null ? (
          <div style={{ color: 'var(--ad-text-dim)', fontSize: 13 }}>
            Cargando instalaciones de tu cuenta VRM…
          </div>
        ) : opts.length === 0 ? (
          <div style={{ color: 'var(--ad-text-dim)', fontSize: 13 }}>
            No se encontraron instalaciones en tu cuenta.
          </div>
        ) : (
          <select id="vs-idSite" name="idSite" required className="admin-field-select">
            <option value="">— Elegir —</option>
            {opts.map((o) => (
              <option key={o.idSite} value={o.idSite}>
                {o.name} (#{o.idSite})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="admin-field">
        <label className="admin-field-label" htmlFor="vs-displayName">
          Nombre público (opcional)
        </label>
        <input
          id="vs-displayName"
          name="displayName"
          type="text"
          className="admin-field-input"
          placeholder="Ej. Planta Solar Sachaca"
          maxLength={120}
        />
        <div style={{ fontSize: 12, color: 'var(--ad-text-faint)', marginTop: 4 }}>
          Si lo dejas en blanco usaremos el nombre original de la instalación en VRM.
        </div>
      </div>

      <button
        type="submit"
        className="admin-btn admin-btn-primary"
        disabled={pending || !opts || opts.length === 0}
      >
        {pending ? 'Vinculando…' : 'Vincular instalación'}
      </button>
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Linked view — toggles + unlink.

function LinkedView({ projectId, site }: { projectId: string; site: VictronSite }) {
  const [s, setS] = useState<VictronSite>(site);
  const [savingFlag, setSavingFlag] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [unlinking, startUnlink] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function toggle(field: keyof VictronSite, value: boolean) {
    const prev = s[field];
    setS({ ...s, [field]: value });
    setSavingFlag(field as string);
    startTransition(async () => {
      const res = await updateVictronSiteAction(projectId, { [field]: value });
      setSavingFlag(null);
      if (!res.ok) {
        setError(res.error ?? 'No se pudo guardar.');
        setS({ ...s, [field]: prev });
      } else {
        setError(null);
      }
    });
  }

  return (
    <div>
      {error && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div
        style={{
          padding: 14,
          borderRadius: 8,
          background: 'var(--ad-surface-2)',
          border: '1px solid var(--ad-border)',
          marginBottom: 16,
          fontSize: 13,
        }}
      >
        <div style={{ color: 'var(--ad-text-dim)' }}>
          Vinculado a la instalación{' '}
          <strong style={{ color: 'var(--ad-text)' }}>#{s.idSite}</strong>
          {s.displayName && <> — {s.displayName}</>}
        </div>
        {s.lastSyncAt && (
          <div style={{ color: 'var(--ad-text-faint)', fontSize: 12, marginTop: 4 }}>
            Último dato: {new Date(s.lastSyncAt).toLocaleString('es-PE')}
          </div>
        )}
      </div>

      <Toggle
        label="Mostrar en la página pública del proyecto"
        hint="Si lo desactivas, el widget de energía en vivo NO se muestra en /proyectos/[slug]. Aun así puedes dar acceso privado al cliente abajo."
        checked={s.isPublicMetrics}
        saving={savingFlag === 'isPublicMetrics'}
        onChange={(v) => toggle('isPublicMetrics', v)}
      />

      <div
        style={{
          padding: '12px 14px',
          borderRadius: 8,
          background: 'var(--ad-surface-2)',
          border: '1px solid var(--ad-border-soft)',
          marginTop: 12,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ad-text-dim)',
            marginBottom: 10,
          }}
        >
          Qué datos mostrar
        </div>
        <Toggle
          label="Producción solar (PV)"
          checked={s.showPv}
          saving={savingFlag === 'showPv'}
          onChange={(v) => toggle('showPv', v)}
        />
        <Toggle
          label="Batería y estado de carga"
          checked={s.showBattery}
          saving={savingFlag === 'showBattery'}
          onChange={(v) => toggle('showBattery', v)}
        />
        <Toggle
          label="Consumo (cargas AC)"
          checked={s.showLoad}
          saving={savingFlag === 'showLoad'}
          onChange={(v) => toggle('showLoad', v)}
        />
        <Toggle
          label="Red eléctrica"
          checked={s.showGrid}
          saving={savingFlag === 'showGrid'}
          onChange={(v) => toggle('showGrid', v)}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          type="button"
          className="admin-btn admin-btn-danger"
          disabled={unlinking}
          onClick={() => {
            if (!confirm('¿Desvincular la instalación Victron de este proyecto? Los datos en caché se borran.')) return;
            startUnlink(async () => {
              const res = await unlinkVictronSiteAction(projectId);
              if (!res.ok) setError(res.error ?? 'No se pudo desvincular.');
            });
          }}
        >
          {unlinking ? 'Desvinculando…' : 'Desvincular instalación'}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  saving,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  saving: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '8px 0',
        cursor: 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={saving}
        style={{ marginTop: 3 }}
      />
      <span style={{ flex: 1, fontSize: 13 }}>
        <span>{label}</span>
        {saving && (
          <span style={{ color: 'var(--ad-text-faint)', fontSize: 11, marginLeft: 8 }}>
            guardando…
          </span>
        )}
        {hint && (
          <div style={{ color: 'var(--ad-text-faint)', fontSize: 11, marginTop: 2 }}>
            {hint}
          </div>
        )}
      </span>
    </label>
  );
}

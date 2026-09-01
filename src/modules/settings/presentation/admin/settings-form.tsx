'use client';

import { useActionState } from 'react';
import type { Settings } from '../../domain/settings';
import { updateSettingsAction } from '@/app/actions/settings';

interface Props {
  settings: Settings;
}

type ActionState = { error?: string } | null;

const DISPLAY_MODE_OPTIONS = [
  { value: 'animation-only', label: 'Solo animación SVG' },
  { value: 'banners-only', label: 'Solo banners' },
  { value: 'banners-over-animation', label: 'Banners sobre animación' },
] as const;

export default function SettingsForm({ settings }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateSettingsAction,
    null,
  );

  return (
    <form action={action}>
      {state?.error && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 20 }}>
          {state.error}
        </div>
      )}

      {/* Hero display mode */}
      <div className="admin-field">
        <label className="admin-field-label">
          Modo de visualización del hero
        </label>
        <select
          name="heroDisplayMode"
          defaultValue={settings.heroDisplayMode}
          className="admin-field-select"
        >
          {DISPLAY_MODE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Max active banners */}
      <div className="admin-field">
        <label className="admin-field-label">
          Máximo de banners activos
        </label>
        <input
          type="number"
          name="maxActiveBanners"
          min={0}
          max={20}
          defaultValue={settings.maxActiveBanners}
          className="admin-field-input"
        />
      </div>

      {/* Anim intensity */}
      <div className="admin-field">
        <label className="admin-field-label">
          Intensidad de animación: <span id="anim-val">{settings.animIntensity}</span>
        </label>
        <input
          type="range"
          name="animIntensity"
          min={0}
          max={5}
          step={0.1}
          defaultValue={settings.animIntensity}
          style={{ width: '100%' }}
          onInput={(e) => {
            const el = document.getElementById('anim-val');
            if (el) el.textContent = (e.target as HTMLInputElement).value;
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ad-text-dim)' }}>
          <span>0</span><span>5</span>
        </div>
      </div>

      {/* Default locale */}
      <div className="admin-field">
        <label className="admin-field-label">
          Idioma por defecto
        </label>
        <select
          name="defaultLocale"
          defaultValue={settings.defaultLocale}
          className="admin-field-select"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="admin-btn admin-btn-primary"
        style={{ marginTop: 24 }}
      >
        {pending ? 'Guardando…' : 'Guardar configuración'}
      </button>
    </form>
  );
}
'use client';

import { useActionState, useTransition } from 'react';
import type { VictronConfigState } from '../../domain/victron-config';
import {
  saveVictronTokenAction,
  clearVictronTokenAction,
} from '@/app/actions/victron';

interface Props {
  state: VictronConfigState;
}

type ActionState = { error?: string; ok?: true; message?: string } | null;

export default function VictronTokenForm({ state }: Props) {
  const [formState, action, pending] = useActionState<ActionState, FormData>(
    saveVictronTokenAction,
    null,
  );
  const [clearing, startClear] = useTransition();

  return (
    <div>
      {/* Status panel */}
      <div
        style={{
          padding: 14,
          borderRadius: 8,
          background: state.isConfigured
            ? 'color-mix(in srgb, var(--ad-success) 10%, transparent)'
            : 'var(--ad-surface-2)',
          border: `1px solid ${
            state.isConfigured
              ? 'color-mix(in srgb, var(--ad-success) 32%, transparent)'
              : 'var(--ad-border)'
          }`,
          marginBottom: 18,
          fontSize: 13,
        }}
      >
        {state.isConfigured ? (
          <>
            <div style={{ color: 'var(--ad-success)', fontWeight: 600, marginBottom: 4 }}>
              ✓ Token activo
            </div>
            <div style={{ color: 'var(--ad-text-dim)' }}>
              Cuenta VRM: <strong style={{ color: 'var(--ad-text)' }}>{state.victronUserName ?? '—'}</strong>
              {state.victronEmail && <> · {state.victronEmail}</>}
            </div>
            {state.lastTestedAt && (
              <div style={{ color: 'var(--ad-text-faint)', fontSize: 12, marginTop: 4 }}>
                Última verificación: {new Date(state.lastTestedAt).toLocaleString('es-PE')}
              </div>
            )}
          </>
        ) : (
          <div style={{ color: 'var(--ad-text-dim)' }}>
            No has guardado un token todavía. Sin esto los proyectos no podrán
            mostrar energía en vivo.
          </div>
        )}
      </div>

      {formState?.error && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 12 }}>
          {formState.error}
        </div>
      )}
      {formState?.ok && formState.message && (
        <div
          role="status"
          style={{
            marginBottom: 12,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'color-mix(in srgb, var(--ad-success) 14%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ad-success) 40%, transparent)',
            color: 'var(--ad-success)',
            fontSize: 13,
          }}
        >
          ✓ {formState.message}
        </div>
      )}

      <form action={action}>
        <div className="admin-field">
          <label className="admin-field-label" htmlFor="victron-token">
            Token API de Victron VRM
          </label>
          <input
            id="victron-token"
            name="token"
            type="password"
            placeholder={state.isConfigured ? '••••••••••••  (pega un token para reemplazar)' : 'Pega aquí el token de VRM'}
            autoComplete="off"
            className="admin-field-input"
          />
          <div style={{ fontSize: 12, color: 'var(--ad-text-faint)', marginTop: 6 }}>
            Lo encuentras en{' '}
            <a
              href="https://vrm.victronenergy.com/access-tokens"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--ad-accent)' }}
            >
              vrm.victronenergy.com → Access Tokens
            </a>
            . Se cifra (AES-256-GCM) antes de guardarse en la base de datos.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={pending}
          >
            {pending ? 'Verificando con Victron…' : state.isConfigured ? 'Reemplazar token' : 'Guardar y probar'}
          </button>

          {state.isConfigured && (
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              disabled={clearing}
              onClick={() => {
                if (!confirm('¿Eliminar el token? Los widgets de energía en vivo dejarán de funcionar hasta que pongas otro.')) return;
                startClear(async () => {
                  await clearVictronTokenAction();
                });
              }}
            >
              {clearing ? 'Eliminando…' : 'Eliminar token'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

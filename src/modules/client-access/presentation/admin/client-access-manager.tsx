'use client';

import { useActionState, useState, useTransition } from 'react';
import type { ClientAccessWithUser } from '../../domain/client-access';
import {
  createClientAccessAction,
  revokeClientAccessAction,
} from '@/app/actions/client-access';

interface Props {
  projectId: string;
  accesses: ClientAccessWithUser[];
}

type CreateState =
  | {
      error?: string;
      ok?: true;
      result?: { email: string; generatedPassword: string | null; alreadyHadAccess: boolean };
    }
  | null;

export default function ClientAccessManager({ projectId, accesses }: Props) {
  const bound = createClientAccessAction.bind(null, projectId);
  const [state, action, pending] = useActionState<CreateState, FormData>(bound, null);
  const [list, setList] = useState(accesses);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleRevoke(id: string) {
    if (!confirm('¿Revocar el acceso? El usuario ya no podrá ver este proyecto desde /cliente.')) {
      return;
    }
    setRevokingId(id);
    startTransition(async () => {
      const res = await revokeClientAccessAction(id, projectId);
      setRevokingId(null);
      if (res.ok) setList((prev) => prev.filter((a) => a.id !== id));
    });
  }

  return (
    <div>
      <p style={{ color: 'var(--ad-text-dim)', fontSize: 13, marginBottom: 14 }}>
        Crea un acceso privado para el dueño de la instalación. Podrá entrar a{' '}
        <code style={{ background: 'var(--ad-surface-2)', padding: '1px 6px', borderRadius: 4 }}>
          /cliente
        </code>{' '}
        con su email y ver las estadísticas aunque el proyecto NO sea público.
      </p>

      {state?.error && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 12 }}>
          {state.error}
        </div>
      )}

      {state?.ok && state.result && (
        <div
          role="status"
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 8,
            background: 'color-mix(in srgb, var(--ad-success) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ad-success) 40%, transparent)',
            fontSize: 13,
          }}
        >
          {state.result.alreadyHadAccess ? (
            <div style={{ color: 'var(--ad-success)' }}>
              Ya tenía acceso. No se cambió la contraseña.
            </div>
          ) : (
            <>
              <div style={{ color: 'var(--ad-success)', fontWeight: 600, marginBottom: 6 }}>
                ✓ Acceso creado para {state.result.email}
              </div>
              {state.result.generatedPassword && (
                <>
                  <div style={{ color: 'var(--ad-text-dim)', marginBottom: 4 }}>
                    Contraseña inicial (cópiala ahora, no se vuelve a mostrar):
                  </div>
                  <code
                    style={{
                      display: 'block',
                      background: 'var(--ad-surface-2)',
                      padding: '8px 10px',
                      borderRadius: 6,
                      fontSize: 14,
                      letterSpacing: 1,
                      color: 'var(--ad-text)',
                      userSelect: 'all',
                    }}
                  >
                    {state.result.generatedPassword}
                  </code>
                </>
              )}
              {!state.result.generatedPassword && (
                <div style={{ color: 'var(--ad-text-dim)' }}>
                  Ya existía un usuario con ese email. Solo se le agregó acceso al proyecto;
                  conserva su contraseña actual.
                </div>
              )}
            </>
          )}
        </div>
      )}

      <form action={action} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div className="admin-field" style={{ flex: 1, marginBottom: 0 }}>
          <label className="admin-field-label" htmlFor="ca-email">
            Email del cliente
          </label>
          <input
            id="ca-email"
            name="email"
            type="email"
            required
            placeholder="cliente@correo.com"
            className="admin-field-input"
            autoComplete="off"
          />
        </div>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
          {pending ? 'Creando…' : 'Crear acceso'}
        </button>
      </form>

      {/* Existing accesses */}
      {list.length > 0 && (
        <div style={{ marginTop: 24 }}>
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
            Accesos vigentes
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {list.map((a) => (
              <li
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  background: 'var(--ad-surface-2)',
                  border: '1px solid var(--ad-border-soft)',
                  borderRadius: 8,
                  marginBottom: 6,
                  fontSize: 13,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div>{a.user.email}</div>
                  <div style={{ color: 'var(--ad-text-faint)', fontSize: 11 }}>
                    Desde {new Date(a.createdAt).toLocaleDateString('es-PE')}
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  disabled={revokingId === a.id}
                  onClick={() => handleRevoke(a.id)}
                >
                  {revokingId === a.id ? 'Revocando…' : 'Revocar'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

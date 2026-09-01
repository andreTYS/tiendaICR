'use client';

import { useActionState } from 'react';
import { signInClientAction, type SignInState } from '@/app/actions/auth';

export function ClientLoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(
    signInClientAction,
    undefined,
  );

  return (
    <form action={action}>
      {state?.error && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 16 }}>
          {state.error}
        </div>
      )}

      <div className="admin-field">
        <label htmlFor="cl-email" className="admin-field-label">
          Correo electrónico
        </label>
        <input
          id="cl-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="admin-field-input"
        />
      </div>

      <div className="admin-field">
        <label htmlFor="cl-password" className="admin-field-label">
          Contraseña
        </label>
        <input
          id="cl-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="admin-field-input"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="admin-btn admin-btn-primary"
        style={{ width: '100%' }}
      >
        {pending ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(
    signInAction,
    undefined
  );

  return (
    <form action={action}>
      {state?.error && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 16 }}>
          {state.error}
        </div>
      )}

      <div className="admin-field">
        <label htmlFor="email" className="admin-field-label">Correo electrónico</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="admin-field-input"
        />
      </div>

      <div className="admin-field">
        <label htmlFor="password" className="admin-field-label">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="admin-field-input"
        />
      </div>

      <button type="submit" disabled={pending} className="admin-btn admin-btn-primary" style={{ width: '100%' }}>
        {pending ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
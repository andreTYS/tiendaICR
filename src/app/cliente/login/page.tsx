import { ClientLoginForm } from '@/modules/auth/presentation/client/client-login-form';

export const metadata = { title: 'Acceso cliente | Inversiones ICR' };

export default function ClientLoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--ad-bg)',
        padding: 20,
      }}
    >
      <div className="admin-card" style={{ width: 380 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo-dark-trim.png"
          alt="ICR"
          style={{ height: 56, display: 'block', margin: '0 auto 20px' }}
        />
        <h1 style={{ fontSize: 18, textAlign: 'center', marginBottom: 4 }}>
          Portal del cliente
        </h1>
        <p
          className="admin-field-hint"
          style={{ textAlign: 'center', marginBottom: 20, color: 'var(--ad-text-dim)', fontSize: 13 }}
        >
          Ingresa con el correo y contraseña que te dio Inversiones ICR.
        </p>
        <ClientLoginForm />
      </div>
    </div>
  );
}

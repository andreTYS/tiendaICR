import { LoginForm } from "@/modules/auth/presentation/admin/login-form";

export const metadata = {
  title: "Iniciar sesión | Inversiones ICR",
};

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--ad-bg)', padding: 20 }}>
      <div className="admin-card" style={{ width: 380 }}>
        <img src="/assets/logo-dark-trim.png" alt="ICR" style={{ height: 56, display: 'block', margin: '0 auto 20px' }} />
        <h1 style={{ fontSize: 18, textAlign: 'center', marginBottom: 4 }}>Iniciar sesión</h1>
        <p className="admin-field-hint" style={{ textAlign: 'center', marginBottom: 20 }}>Panel administrativo</p>
        <LoginForm />
      </div>
    </div>
  );
}
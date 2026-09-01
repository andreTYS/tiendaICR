import Link from 'next/link';
import { auth } from '@/shared/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/shared/lib/prisma';
import AdminPageShell from './_components/admin-page-shell';

export const metadata = {
  title: 'Dashboard | Inversiones ICR Admin',
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  // Quick aggregates — single parallel DB roundtrip
  const [banners, activeBanners, projects, activeProjects, categories, messages, unreadMessages] =
    await Promise.all([
      prisma.banner.count(),
      prisma.banner.count({ where: { isActive: true } }),
      prisma.project.count(),
      prisma.project.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { readAt: null } }),
    ]);

  return (
    <AdminPageShell
      title={`Hola, ${session.user.email?.split('@')[0] ?? 'admin'}`}
      description="Resumen rápido del contenido del sitio."
    >
      <section className="admin-stats">
        <StatCard
          label="Banners activos"
          value={`${activeBanners} / ${banners}`}
          hint={
            activeBanners === 0
              ? 'Sin banners — se muestra la animación SVG'
              : `${banners - activeBanners} inactivos`
          }
        />
        <StatCard
          label="Proyectos publicados"
          value={`${activeProjects} / ${projects}`}
          hint={`${categories} categorías`}
        />
        <StatCard
          label="Mensajes de contacto"
          value={String(messages)}
          hint={unreadMessages > 0 ? `${unreadMessages} sin leer` : 'Todo al día'}
        />
      </section>

      <section className="admin-card">
        <h2 style={{ fontSize: 16, margin: 0, marginBottom: 12 }}>Atajos</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/admin/banners/new" prefetch={false} className="admin-btn admin-btn-primary">
            + Nuevo banner
          </Link>
          <Link href="/admin/proyectos/new" prefetch={false} className="admin-btn admin-btn-primary">
            + Nuevo proyecto
          </Link>
          <Link href="/admin/categorias/new" prefetch={false} className="admin-btn admin-btn-secondary">
            + Nueva categoría
          </Link>
          {unreadMessages > 0 && (
            <Link href="/admin/mensajes" prefetch={false} className="admin-btn admin-btn-secondary">
              Ver mensajes sin leer ({unreadMessages})
            </Link>
          )}
        </div>
      </section>
    </AdminPageShell>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat-label">{label}</span>
      <span className="admin-stat-value">{value}</span>
      {hint && <span className="admin-stat-hint">{hint}</span>}
    </div>
  );
}

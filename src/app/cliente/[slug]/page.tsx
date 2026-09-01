import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/shared/lib/auth';
import type { Role } from '@/modules/auth/domain/user-role';
import { prismaProjectRepository } from '@/modules/projects/infrastructure/prisma-project-repository';
import { prismaClientAccessRepository } from '@/modules/client-access/infrastructure/prisma-client-access-repository';
import { prismaVictronSiteRepository } from '@/modules/victron/infrastructure/prisma-victron-site-repository';
import LiveEnergyWidget from '@/modules/victron/presentation/public/live-energy-widget';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ClientProjectPage({ params }: Props) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user) redirect('/cliente/login');

  const role = session.user.role as Role;
  const userId = (session.user as { id: string }).id;

  const project = await prismaProjectRepository.findBySlug(slug);
  if (!project) notFound();

  // ADMIN/EDITOR can preview any project; CLIENT needs explicit access.
  if (role === 'CLIENT') {
    const allowed = await prismaClientAccessRepository.has(userId, project.id);
    if (!allowed) redirect('/cliente');
  }

  const site = await prismaVictronSiteRepository.findByProjectId(project.id);

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '32px 24px 80px' }}>
      <nav
        style={{
          marginBottom: 20,
          fontSize: 13,
          color: 'var(--ad-text-dim)',
        }}
      >
        <Link href="/cliente" style={{ color: 'var(--ad-text-dim)' }}>
          ← Mis instalaciones
        </Link>
      </nav>

      <h1 style={{ fontSize: 28, marginBottom: 4 }}>{project.titleEs}</h1>
      {project.location && (
        <div style={{ color: 'var(--ad-text-dim)', fontSize: 14, marginBottom: 28 }}>
          {project.location}
        </div>
      )}

      {site ? (
        <LiveEnergyWidget slug={project.slug} source="client" refreshMs={60_000} />
      ) : (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            border: '1px dashed var(--ad-border)',
            color: 'var(--ad-text-dim)',
            textAlign: 'center',
          }}
        >
          Este proyecto aún no tiene un medidor Victron vinculado.
        </div>
      )}
    </main>
  );
}

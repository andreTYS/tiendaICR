import { notFound } from 'next/navigation';
import { listCategories } from '@/modules/categories/application/list-categories';
import { prismaCategoryRepository } from '@/modules/categories/infrastructure/prisma-category-repository';
import { prismaProjectRepository } from '@/modules/projects/infrastructure/prisma-project-repository';
import ProjectForm from '@/modules/projects/presentation/admin/project-form';
import { updateProjectAction } from '@/app/actions/projects';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

import { prismaVictronSiteRepository } from '@/modules/victron/infrastructure/prisma-victron-site-repository';
import { prismaVictronConfigRepository } from '@/modules/victron/infrastructure/prisma-victron-config-repository';
import VictronSitePanel from '@/modules/victron/presentation/admin/victron-site-panel';

import { prismaClientAccessRepository } from '@/modules/client-access/infrastructure/prisma-client-access-repository';
import ClientAccessManager from '@/modules/client-access/presentation/admin/client-access-manager';

export const metadata = { title: 'Editar proyecto | Inversiones ICR Admin' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProyectoPage({ params }: Props) {
  const { id } = await params;

  const [project, categoriesResult, victronSite, victronState, accesses] = await Promise.all([
    prismaProjectRepository.findById(id),
    listCategories({ repo: prismaCategoryRepository }),
    prismaVictronSiteRepository.findByProjectId(id),
    prismaVictronConfigRepository.getState(),
    prismaClientAccessRepository.listByProject(id),
  ]);

  if (!project) notFound();

  const categories = categoriesResult.ok ? categoriesResult.value : [];
  const boundAction = updateProjectAction.bind(null, id);

  return (
    <AdminPageShell
      title="Editar proyecto"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Proyectos', href: '/admin/proyectos' },
        { label: 'Editar' },
      ]}
    >
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <ProjectForm
          action={boundAction}
          project={project}
          categories={categories}
          submitLabel="Guardar cambios"
        />
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Energía en vivo (Victron)</h2>
        <p
          style={{
            color: 'var(--ad-text-dim)',
            fontSize: 13,
            marginBottom: 14,
            maxWidth: 640,
          }}
        >
          Conecta este proyecto con una instalación VRM para mostrar producción, consumo y batería en tiempo real.
        </p>
        <div className="admin-card">
          <VictronSitePanel
            projectId={id}
            site={victronSite}
            tokenConfigured={victronState.isConfigured}
          />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Acceso privado del cliente</h2>
        <p
          style={{
            color: 'var(--ad-text-dim)',
            fontSize: 13,
            marginBottom: 14,
            maxWidth: 640,
          }}
        >
          Si el dueño NO quiere que su consumo se vea en la página pública, créale un acceso
          aquí. Verá sus datos solo después de iniciar sesión en /cliente.
        </p>
        <div className="admin-card">
          <ClientAccessManager projectId={id} accesses={accesses} />
        </div>
      </section>
    </AdminPageShell>
  );
}

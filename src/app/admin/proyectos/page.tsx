import Link from 'next/link';
import { listAllProjects } from '@/modules/projects/application/list-all-projects';
import { listCategories } from '@/modules/categories/application/list-categories';
import { prismaProjectRepository } from '@/modules/projects/infrastructure/prisma-project-repository';
import { prismaCategoryRepository } from '@/modules/categories/infrastructure/prisma-category-repository';
import ProjectTable from '@/modules/projects/presentation/admin/project-table';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

export const metadata = { title: 'Proyectos | Inversiones ICR Admin' };

export default async function AdminProyectosPage() {
  const [projectsResult, categoriesResult] = await Promise.all([
    listAllProjects({ repo: prismaProjectRepository }),
    listCategories({ repo: prismaCategoryRepository }),
  ]);

  const projects = projectsResult.ok ? projectsResult.value : [];
  const categories = categoriesResult.ok ? categoriesResult.value : [];

  return (
    <AdminPageShell
      title="Proyectos"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Proyectos' }]}
      actions={
        <Link href="/admin/proyectos/new" prefetch={false} className="admin-btn admin-btn-primary">
          + Nuevo proyecto
        </Link>
      }
    >
      {projects.length === 0 ? (
        <div className="admin-empty">
          <p>No hay proyectos todavía.</p>
          <Link href="/admin/proyectos/new" prefetch={false} className="admin-btn admin-btn-primary" style={{ marginTop: 12 }}>
            Crear el primero
          </Link>
        </div>
      ) : (
        <ProjectTable projects={projects} categories={categories} />
      )}
    </AdminPageShell>
  );
}
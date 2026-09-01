import { listCategories } from '@/modules/categories/application/list-categories';
import { prismaCategoryRepository } from '@/modules/categories/infrastructure/prisma-category-repository';
import ProjectForm from '@/modules/projects/presentation/admin/project-form';
import { createProjectAction } from '@/app/actions/projects';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

export const metadata = { title: 'Nuevo proyecto | Inversiones ICR Admin' };

export default async function NewProyectoPage() {
  const categoriesResult = await listCategories({ repo: prismaCategoryRepository });
  const categories = categoriesResult.ok ? categoriesResult.value : [];

  return (
    <AdminPageShell
      title="Nuevo proyecto"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Proyectos', href: '/admin/proyectos' },
        { label: 'Nuevo' }
      ]}
    >
      <div className="admin-card">
        <ProjectForm action={createProjectAction} categories={categories} submitLabel="Crear proyecto" />
      </div>
    </AdminPageShell>
  );
}
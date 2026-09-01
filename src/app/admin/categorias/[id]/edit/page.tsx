import { notFound } from 'next/navigation';
import { getCategory } from '@/modules/categories/application/get-category';
import { prismaCategoryRepository } from '@/modules/categories/infrastructure/prisma-category-repository';
import CategoryForm from '@/modules/categories/presentation/admin/category-form';
import { updateCategoryAction } from '@/app/actions/categories';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

export const metadata = { title: 'Editar categoría | Inversiones ICR Admin' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoriaPage({ params }: Props) {
  const { id } = await params;
  const result = await getCategory({ id }, { repo: prismaCategoryRepository });
  if (!result.ok) notFound();

  const boundAction = updateCategoryAction.bind(null, id);

  return (
    <AdminPageShell
      title="Editar categoría"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Categorías', href: '/admin/categorias' },
        { label: 'Editar' }
      ]}
    >
      <div className="admin-card">
        <CategoryForm action={boundAction} category={result.value} submitLabel="Guardar cambios" />
      </div>
    </AdminPageShell>
  );
}
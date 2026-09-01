import CategoryForm from '@/modules/categories/presentation/admin/category-form';
import { createCategoryAction } from '@/app/actions/categories';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

export const metadata = { title: 'Nueva categoría | Inversiones ICR Admin' };

export default function NewCategoriaPage() {
  return (
    <AdminPageShell
      title="Nueva categoría"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Categorías', href: '/admin/categorias' },
        { label: 'Nueva' }
      ]}
    >
      <div className="admin-card">
        <CategoryForm action={createCategoryAction} submitLabel="Crear categoría" />
      </div>
    </AdminPageShell>
  );
}
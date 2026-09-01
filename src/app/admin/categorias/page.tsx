import Link from 'next/link';
import { listCategories } from '@/modules/categories/application/list-categories';
import { prismaCategoryRepository } from '@/modules/categories/infrastructure/prisma-category-repository';
import CategoryList from '@/modules/categories/presentation/admin/category-list';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

export const metadata = { title: 'Categorías | Inversiones ICR Admin' };

export default async function AdminCategoriasPage() {
  const result = await listCategories({ repo: prismaCategoryRepository });
  const categories = result.ok ? result.value : [];

  return (
    <AdminPageShell
      title="Categorías"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Categorías' }]}
      actions={
        <Link href="/admin/categorias/new" prefetch={false} className="admin-btn admin-btn-primary">
          + Nueva categoría
        </Link>
      }
    >
      <CategoryList categories={categories} />
    </AdminPageShell>
  );
}
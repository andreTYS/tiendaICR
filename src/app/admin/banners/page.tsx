import Link from 'next/link';
import { listAllBanners } from '@/modules/banners/application/list-all-banners';
import { prismaBannerRepository } from '@/modules/banners/infrastructure/prisma-banner-repository';
import BannerTable from '@/modules/banners/presentation/admin/banner-table';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

export const metadata = { title: 'Banners | Inversiones ICR Admin' };

export default async function AdminBannersPage() {
  const result = await listAllBanners({ repo: prismaBannerRepository });
  const banners = result.ok ? result.value : [];

  return (
    <AdminPageShell
      title="Banners"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Banners' }]}
      actions={
        <Link href="/admin/banners/new" prefetch={false} className="admin-btn admin-btn-primary">
          + Nuevo banner
        </Link>
      }
    >
      {banners.length === 0 ? (
        <div className="admin-empty">
          <p>No hay banners todavía.</p>
          <Link href="/admin/banners/new" prefetch={false} className="admin-btn admin-btn-primary" style={{ marginTop: 12 }}>
            Crear el primero
          </Link>
        </div>
      ) : (
        <BannerTable banners={banners} />
      )}
    </AdminPageShell>
  );
}
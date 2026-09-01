import { getSettings } from '@/modules/settings/application/get-settings';
import { prismaSettingsRepository } from '@/modules/settings/infrastructure/prisma-settings-repository';
import { prismaBannerRepository } from '@/modules/banners/infrastructure/prisma-banner-repository';
import BannerForm from '@/modules/banners/presentation/admin/banner-form';
import { createBannerAction } from '@/app/actions/banners';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

export const metadata = { title: 'Nuevo banner | Inversiones ICR Admin' };

export default async function NewBannerPage() {
  const [settingsResult, activeCount] = await Promise.all([
    getSettings({ repo: prismaSettingsRepository }),
    prismaBannerRepository.countActive(),
  ]);

  const maxActiveBanners = settingsResult.ok
    ? settingsResult.value.maxActiveBanners
    : 5;
  const maxReached = activeCount >= maxActiveBanners;

  return (
    <AdminPageShell
      title="Nuevo banner"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Banners', href: '/admin/banners' },
        { label: 'Nuevo' }
      ]}
    >
      <div className="admin-card">
        <BannerForm
          action={createBannerAction}
          maxReached={maxReached}
          submitLabel="Crear banner"
        />
      </div>
    </AdminPageShell>
  );
}
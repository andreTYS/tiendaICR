import { notFound } from 'next/navigation';
import { getSettings } from '@/modules/settings/application/get-settings';
import { prismaSettingsRepository } from '@/modules/settings/infrastructure/prisma-settings-repository';
import { prismaBannerRepository } from '@/modules/banners/infrastructure/prisma-banner-repository';
import BannerForm from '@/modules/banners/presentation/admin/banner-form';
import { updateBannerAction } from '@/app/actions/banners';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

export const metadata = { title: 'Editar banner | Inversiones ICR Admin' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params;

  const [banner, settingsResult, activeCount] = await Promise.all([
    prismaBannerRepository.findById(id),
    getSettings({ repo: prismaSettingsRepository }),
    prismaBannerRepository.countActive(),
  ]);

  if (!banner) notFound();

  const maxActiveBanners = settingsResult.ok
    ? settingsResult.value.maxActiveBanners
    : 5;

  const maxReached = !banner.isActive && activeCount >= maxActiveBanners;

  const boundAction = updateBannerAction.bind(null, id);

  return (
    <AdminPageShell
      title="Editar banner"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Banners', href: '/admin/banners' },
        { label: 'Editar' }
      ]}
    >
      <div className="admin-card">
        <BannerForm
          action={boundAction}
          banner={banner}
          maxReached={maxReached}
          submitLabel="Guardar cambios"
        />
      </div>
    </AdminPageShell>
  );
}
import { getSettings } from '@/modules/settings/application/get-settings';
import { prismaSettingsRepository } from '@/modules/settings/infrastructure/prisma-settings-repository';
import { prismaVictronConfigRepository } from '@/modules/victron/infrastructure/prisma-victron-config-repository';
import SettingsForm from '@/modules/settings/presentation/admin/settings-form';
import VictronTokenForm from '@/modules/victron/presentation/admin/victron-token-form';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

export const metadata = { title: 'Configuración | Inversiones ICR Admin' };

export default async function AdminSettingsPage() {
  const [settingsResult, victronState] = await Promise.all([
    getSettings({ repo: prismaSettingsRepository }),
    prismaVictronConfigRepository.getState(),
  ]);

  const settings = settingsResult.ok
    ? settingsResult.value
    : {
        id: 1 as const,
        heroDisplayMode: 'animation-only' as const,
        maxActiveBanners: 5,
        animIntensity: 1.6,
        defaultLocale: 'es' as const,
        updatedAt: new Date(),
      };

  return (
    <AdminPageShell
      title="Configuración del sitio"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Configuración' }]}
    >
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>General</h2>
        <p style={{ color: 'var(--ad-text-dim)', fontSize: 13, marginBottom: 14, maxWidth: 640 }}>
          Apariencia del hero, idioma por defecto y límites de banners.
        </p>
        <div className="admin-card">
          <SettingsForm settings={settings} />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Integración Victron VRM</h2>
        <p style={{ color: 'var(--ad-text-dim)', fontSize: 13, marginBottom: 14, maxWidth: 640 }}>
          Token compartido para leer el estado y consumo en tiempo real de tus instalaciones
          solares. Se almacena cifrado y solo se descifra en el servidor cuando hace falta.
        </p>
        <div className="admin-card">
          <VictronTokenForm state={victronState} />
        </div>
      </section>
    </AdminPageShell>
  );
}

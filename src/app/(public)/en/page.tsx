import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';
import { getDictionary } from '@/shared/lib/i18n/get-dictionary';

export const metadata: Metadata = {
  title: 'Inversiones ICR — Solar energy in Peru',
  description:
    'We design, install and monitor high-efficiency solar systems for homes, businesses, industry and mining in Peru.',
  openGraph: {
    title: 'Inversiones ICR — Solar energy in Peru',
    description: 'High-efficiency solar systems for Peru',
    locale: 'en_US',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
};
import Hero from '@/shared/ui/organisms/hero';
import Marquee from '@/shared/ui/organisms/marquee';
import Intro from '@/shared/ui/organisms/intro';
import HomeCTAGrid from '@/shared/ui/organisms/home-cta-grid';
import HeroBanners from '@/shared/ui/organisms/hero-banners';
import { listActiveBanners } from '@/modules/banners/application/list-active-banners';
import { prismaBannerRepository } from '@/modules/banners/infrastructure/prisma-banner-repository';
import { getSettings } from '@/modules/settings/application/get-settings';
import { prismaSettingsRepository } from '@/modules/settings/infrastructure/prisma-settings-repository';

const getCachedActiveBanners = unstable_cache(
  async () => {
    const result = await listActiveBanners({ repo: prismaBannerRepository });
    return result.ok ? result.value : [];
  },
  ['active-banners'],
  { tags: ['banners'] },
);

export default async function HomeEnPage() {
  const dict = getDictionary('en');

  const [banners, settingsResult] = await Promise.all([
    getCachedActiveBanners(),
    getSettings({ repo: prismaSettingsRepository }),
  ]);

  const settings = settingsResult.ok
    ? settingsResult.value
    : { heroDisplayMode: 'animation-only' as const, animIntensity: 1.6 };

  const showBanners =
    settings.heroDisplayMode !== 'animation-only' && banners.length > 0;

  const bannersSlot = showBanners ? (
    <HeroBanners
      banners={banners.map((b) => ({
        id: b.id,
        titleEs: b.titleEs,
        titleEn: b.titleEn,
        descEs: b.descEs,
        descEn: b.descEn,
        imageUrl: `/api/media/${b.imageKey}`,
      }))}
      locale="en"
    />
  ) : undefined;

  return (
    <>
      <Hero
        dict={dict}
        locale="en"
        bannersSlot={bannersSlot}
        displayMode={settings.heroDisplayMode}
        animIntensity={settings.animIntensity}
      />
      <Marquee items={dict.marquee} />
      <Intro dict={dict} />
      <HomeCTAGrid locale="en" />
    </>
  );
}

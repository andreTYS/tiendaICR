import { prisma } from '@/shared/lib/prisma';
import type { SettingsRepository } from '../domain/settings-repository';
import type { Settings } from '../domain/settings';
import type { UpdateSettingsInput } from '../domain/settings-schemas';
import type { HeroDisplayMode } from '../domain/hero-display-mode';
import type { HeroDisplayMode as PrismaHeroDisplayMode } from '@prisma/client';

// ─── Enum mappers ─────────────────────────────────────────────────────────────

function toDomainMode(mode: PrismaHeroDisplayMode): HeroDisplayMode {
  const map: Record<PrismaHeroDisplayMode, HeroDisplayMode> = {
    BANNERS_ONLY: 'banners-only',
    BANNERS_OVER_ANIMATION: 'banners-over-animation',
    ANIMATION_ONLY: 'animation-only',
  };
  return map[mode];
}

function toPrismaMode(mode: HeroDisplayMode): PrismaHeroDisplayMode {
  const map: Record<HeroDisplayMode, PrismaHeroDisplayMode> = {
    'banners-only': 'BANNERS_ONLY',
    'banners-over-animation': 'BANNERS_OVER_ANIMATION',
    'animation-only': 'ANIMATION_ONLY',
  };
  return map[mode];
}

function toDomain(row: {
  id: number;
  heroDisplayMode: PrismaHeroDisplayMode;
  maxActiveBanners: number;
  animIntensity: number;
  defaultLocale: string;
  updatedAt: Date;
}): Settings {
  return {
    id: 1,
    heroDisplayMode: toDomainMode(row.heroDisplayMode),
    maxActiveBanners: row.maxActiveBanners,
    animIntensity: row.animIntensity,
    defaultLocale: row.defaultLocale as 'es' | 'en',
    updatedAt: row.updatedAt,
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const prismaSettingsRepository: SettingsRepository = {
  async get(): Promise<Settings> {
    const row = await prisma.settings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        heroDisplayMode: 'ANIMATION_ONLY',
        maxActiveBanners: 5,
        animIntensity: 1.6,
        defaultLocale: 'es',
      },
      update: {},
    });
    return toDomain(row);
  },

  async update(input: UpdateSettingsInput): Promise<Settings> {
    const data: Record<string, unknown> = {};
    if (input.heroDisplayMode !== undefined)
      data.heroDisplayMode = toPrismaMode(input.heroDisplayMode);
    if (input.maxActiveBanners !== undefined)
      data.maxActiveBanners = input.maxActiveBanners;
    if (input.animIntensity !== undefined)
      data.animIntensity = input.animIntensity;
    if (input.defaultLocale !== undefined)
      data.defaultLocale = input.defaultLocale;

    const row = await prisma.settings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        heroDisplayMode: 'ANIMATION_ONLY',
        maxActiveBanners: 5,
        animIntensity: 1.6,
        defaultLocale: 'es',
        ...data,
      },
      update: data,
    });
    return toDomain(row);
  },
};

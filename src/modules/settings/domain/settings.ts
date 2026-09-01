import type { HeroDisplayMode } from './hero-display-mode';

export interface Settings {
  id: 1;
  heroDisplayMode: HeroDisplayMode;
  maxActiveBanners: number;
  animIntensity: number;
  defaultLocale: 'es' | 'en';
  updatedAt: Date;
}

export const SETTINGS_DEFAULTS: Omit<Settings, 'id' | 'updatedAt'> = {
  heroDisplayMode: 'animation-only',
  maxActiveBanners: 5,
  animIntensity: 1.6,
  defaultLocale: 'es',
};

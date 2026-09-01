export type HeroDisplayMode = 'banners-only' | 'banners-over-animation' | 'animation-only';

export const HERO_DISPLAY_MODES = [
  'banners-only',
  'banners-over-animation',
  'animation-only',
] as const satisfies readonly HeroDisplayMode[];

export function isHeroDisplayMode(value: unknown): value is HeroDisplayMode {
  return HERO_DISPLAY_MODES.includes(value as HeroDisplayMode);
}

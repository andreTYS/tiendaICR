import { MaxActiveBannersReachedError } from './banner-errors';

/**
 * Asserts that activating one more banner does not exceed the configured maximum.
 * Throws MaxActiveBannersReachedError when activeCount >= max.
 *
 * @param activeCount  Current number of active banners (before adding the new one)
 * @param max          Maximum allowed active banners (from Settings.maxActiveBanners)
 */
export function assertMaxActive(activeCount: number, max: number): void {
  if (activeCount >= max) {
    throw new MaxActiveBannersReachedError(activeCount, max);
  }
}

import { describe, it, expect } from 'vitest';
import { getSettings } from './get-settings';
import { InMemorySettingsRepository } from '../infrastructure/__fakes__/in-memory-settings-repository';

describe('getSettings', () => {
  it('returns current settings from repository', async () => {
    const repo = new InMemorySettingsRepository();
    const result = await getSettings({ repo });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.id).toBe(1);
    expect(result.value.maxActiveBanners).toBe(5);
    expect(result.value.animIntensity).toBe(1.6);
    expect(result.value.defaultLocale).toBe('es');
    expect(result.value.heroDisplayMode).toBe('animation-only');
  });

  it('always succeeds — never returns an error', async () => {
    const repo = new InMemorySettingsRepository();
    const result = await getSettings({ repo });
    expect(result.ok).toBe(true);
  });

  it('reflects seeded custom values', async () => {
    const repo = new InMemorySettingsRepository();
    repo.seed({ heroDisplayMode: 'banners-only', maxActiveBanners: 3 });

    const result = await getSettings({ repo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.heroDisplayMode).toBe('banners-only');
    expect(result.value.maxActiveBanners).toBe(3);
  });
});

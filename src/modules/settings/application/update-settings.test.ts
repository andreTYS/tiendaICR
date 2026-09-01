import { describe, it, expect, vi } from 'vitest';
import { updateSettings } from './update-settings';
import { InMemorySettingsRepository } from '../infrastructure/__fakes__/in-memory-settings-repository';

function makeCountActive(n: number) {
  return vi.fn().mockResolvedValue(n);
}

describe('updateSettings', () => {
  it('rejects non-ADMIN callers with UNAUTHORIZED', async () => {
    const repo = new InMemorySettingsRepository();
    const result = await updateSettings(
      { data: { maxActiveBanners: 3 }, callerRole: 'EDITOR' },
      { repo, countActiveBanners: makeCountActive(0) },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('UNAUTHORIZED');
  });

  it('rejects invalid data with VALIDATION', async () => {
    const repo = new InMemorySettingsRepository();
    const result = await updateSettings(
      { data: { maxActiveBanners: -1 }, callerRole: 'ADMIN' },
      { repo, countActiveBanners: makeCountActive(0) },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('VALIDATION');
  });

  it('rejects lowering maxActiveBanners below current active count', async () => {
    const repo = new InMemorySettingsRepository();
    const result = await updateSettings(
      { data: { maxActiveBanners: 2 }, callerRole: 'ADMIN' },
      { repo, countActiveBanners: makeCountActive(3) },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('WOULD_DEACTIVATE_BANNERS');
  });

  it('allows setting maxActiveBanners exactly equal to active count', async () => {
    const repo = new InMemorySettingsRepository();
    const result = await updateSettings(
      { data: { maxActiveBanners: 3 }, callerRole: 'ADMIN' },
      { repo, countActiveBanners: makeCountActive(3) },
    );
    expect(result.ok).toBe(true);
  });

  it('allows ADMIN to update heroDisplayMode', async () => {
    const repo = new InMemorySettingsRepository();
    const result = await updateSettings(
      { data: { heroDisplayMode: 'banners-only' }, callerRole: 'ADMIN' },
      { repo, countActiveBanners: makeCountActive(0) },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.heroDisplayMode).toBe('banners-only');
  });

  it('allows ADMIN to update animIntensity', async () => {
    const repo = new InMemorySettingsRepository();
    const result = await updateSettings(
      { data: { animIntensity: 2.5 }, callerRole: 'ADMIN' },
      { repo, countActiveBanners: makeCountActive(0) },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.animIntensity).toBe(2.5);
  });

  it('rejects animIntensity > 5 with VALIDATION', async () => {
    const repo = new InMemorySettingsRepository();
    const result = await updateSettings(
      { data: { animIntensity: 6 }, callerRole: 'ADMIN' },
      { repo, countActiveBanners: makeCountActive(0) },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('VALIDATION');
  });

  it('does not call countActiveBanners when maxActiveBanners is not in patch', async () => {
    const repo = new InMemorySettingsRepository();
    const countFn = makeCountActive(0);
    await updateSettings(
      { data: { heroDisplayMode: 'banners-over-animation' }, callerRole: 'ADMIN' },
      { repo, countActiveBanners: countFn },
    );
    expect(countFn).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { updateBanner } from './update-banner';
import { InMemoryBannerRepository } from '../infrastructure/__fakes__/in-memory-banner-repository';
import { InMemoryStorageProvider } from '@/modules/media/infrastructure/__fakes__/in-memory-storage-provider';
import { InMemorySettingsRepository } from '@/modules/settings/infrastructure/__fakes__/in-memory-settings-repository';

let repo: InMemoryBannerRepository;
let storage: InMemoryStorageProvider;
let settingsRepo: InMemorySettingsRepository;

beforeEach(() => {
  repo = new InMemoryBannerRepository();
  repo.clear();
  storage = new InMemoryStorageProvider();
  settingsRepo = new InMemorySettingsRepository();
});

function seedBanner(overrides = {}) {
  return repo.seed({
    titleEs: 'Existing',
    descEs: 'Desc',
    imageKey: '2024/01/img.jpg',
    isActive: false,
    ...overrides,
  });
}

describe('updateBanner', () => {
  it('updates text fields of an existing banner', async () => {
    const banner = seedBanner();
    const result = await updateBanner(
      { id: banner.id, patch: { titleEs: 'Nuevo título' } },
      { repo, storage, settingsRepo },
    );

    expect(result.ok).toBe(true);
    const updated = await repo.findById(banner.id);
    expect(updated?.titleEs).toBe('Nuevo título');
  });

  it('returns NOT_FOUND when banner does not exist', async () => {
    const result = await updateBanner(
      { id: 'nonexistent', patch: { titleEs: 'X' } },
      { repo, storage, settingsRepo },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NOT_FOUND');
  });

  it('rejects activating when already at max', async () => {
    // seed 5 active banners
    for (let i = 0; i < 5; i++) {
      repo.seed({ titleEs: `B${i}`, descEs: 'd', imageKey: 'k', isActive: true });
    }
    const inactive = seedBanner({ isActive: false });

    const result = await updateBanner(
      { id: inactive.id, patch: { isActive: true } },
      { repo, storage, settingsRepo },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('MAX_ACTIVE_REACHED');
  });

  it('allows deactivating a banner regardless of count', async () => {
    const active = seedBanner({ isActive: true });
    const result = await updateBanner(
      { id: active.id, patch: { isActive: false } },
      { repo, storage, settingsRepo },
    );
    expect(result.ok).toBe(true);
  });

  it('allows activating when already active (no double-count)', async () => {
    // 5 active banners; updating one that is already active should not count itself twice
    const banners = Array.from({ length: 5 }, (_, i) =>
      repo.seed({ titleEs: `B${i}`, descEs: 'd', imageKey: 'k', isActive: true }),
    );
    const result = await updateBanner(
      { id: banners[0]!.id, patch: { titleEs: 'Updated title', isActive: true } },
      { repo, storage, settingsRepo },
    );
    expect(result.ok).toBe(true);
  });

  it('rejects invalid patch data with VALIDATION', async () => {
    const banner = seedBanner();
    const result = await updateBanner(
      { id: banner.id, patch: { titleEs: '' } },
      { repo, storage, settingsRepo },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('VALIDATION');
  });
});

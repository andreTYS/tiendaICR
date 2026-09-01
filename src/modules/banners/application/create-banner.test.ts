import { describe, it, expect, beforeEach } from 'vitest';
import { createBanner } from './create-banner';
import { InMemoryBannerRepository } from '../infrastructure/__fakes__/in-memory-banner-repository';
import { InMemoryStorageProvider } from '@/modules/media/infrastructure/__fakes__/in-memory-storage-provider';
import { InMemorySettingsRepository } from '@/modules/settings/infrastructure/__fakes__/in-memory-settings-repository';

const img = {
  imageBuffer: Buffer.from('img'),
  imageMimeType: 'image/jpeg',
  imageOriginalName: 'photo.jpg',
  imageSize: 3,
};

function makeInput(overrides = {}) {
  return {
    titleEs: 'Banner ES',
    descEs: 'Descripción ES',
    isActive: false,
    callerRole: 'EDITOR' as const,
    ...img,
    ...overrides,
  };
}

let repo: InMemoryBannerRepository;
let storage: InMemoryStorageProvider;
let settingsRepo: InMemorySettingsRepository;

beforeEach(() => {
  repo = new InMemoryBannerRepository();
  repo.clear();
  storage = new InMemoryStorageProvider();
  settingsRepo = new InMemorySettingsRepository();
});

describe('createBanner', () => {
  it('creates an inactive banner and returns its id', async () => {
    const result = await createBanner(makeInput({ isActive: false }), {
      repo,
      storage,
      settingsRepo,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.id).toBeDefined();
  });

  it('uploads the image and stores the key in the banner', async () => {
    const result = await createBanner(makeInput(), { repo, storage, settingsRepo });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const banner = await repo.findById(result.value.id);
    expect(banner?.imageKey).toBeDefined();
    expect(banner?.imageKey.length).toBeGreaterThan(0);
  });

  it('creates an active banner when count is below max', async () => {
    // default max = 5, 0 active → ok
    const result = await createBanner(makeInput({ isActive: true }), {
      repo,
      storage,
      settingsRepo,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const banner = await repo.findById(result.value.id);
    expect(banner?.isActive).toBe(true);
  });

  it('rejects activating when already at max active banners', async () => {
    // seed 5 active banners (max is 5)
    for (let i = 0; i < 5; i++) {
      repo.seed({ titleEs: `B${i}`, descEs: 'd', imageKey: 'k', isActive: true });
    }

    const result = await createBanner(makeInput({ isActive: true }), {
      repo,
      storage,
      settingsRepo,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('MAX_ACTIVE_REACHED');
  });

  it('allows creating inactive banner even when at max active', async () => {
    for (let i = 0; i < 5; i++) {
      repo.seed({ titleEs: `B${i}`, descEs: 'd', imageKey: 'k', isActive: true });
    }

    const result = await createBanner(makeInput({ isActive: false }), {
      repo,
      storage,
      settingsRepo,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects missing titleEs with VALIDATION', async () => {
    const result = await createBanner(
      makeInput({ titleEs: '' }),
      { repo, storage, settingsRepo },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('VALIDATION');
  });

  it('rejects invalid MIME type with INVALID_IMAGE', async () => {
    const result = await createBanner(
      makeInput({ imageMimeType: 'image/gif' }),
      { repo, storage, settingsRepo },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('INVALID_IMAGE');
  });

  it('stores EN fields when provided', async () => {
    const result = await createBanner(
      makeInput({ titleEn: 'English Title', descEn: 'English Desc' }),
      { repo, storage, settingsRepo },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const banner = await repo.findById(result.value.id);
    expect(banner?.titleEn).toBe('English Title');
    expect(banner?.descEn).toBe('English Desc');
  });
});

import { describe, it, expect } from 'vitest';
import { uploadImage } from './upload-image';
import { InMemoryStorageProvider } from '../infrastructure/__fakes__/in-memory-storage-provider';
import { MAX_FILE_SIZE } from '../domain/media-schemas';

function makeBuffer(size: number): Buffer {
  return Buffer.alloc(size, 0xff);
}

describe('uploadImage', () => {
  it('uploads a valid JPEG and returns key and url', async () => {
    const storage = new InMemoryStorageProvider();
    const result = await uploadImage(
      {
        buffer: makeBuffer(1024),
        mimeType: 'image/jpeg',
        originalName: 'photo.jpg',
        size: 1024,
      },
      { storage },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.key).toBeDefined();
    expect(result.value.url).toMatch('/api/media/');
    expect(result.value.size).toBe(1024);
  });

  it('rejects disallowed MIME type with INVALID_MIME', async () => {
    const storage = new InMemoryStorageProvider();
    const result = await uploadImage(
      {
        buffer: makeBuffer(512),
        mimeType: 'image/gif',
        originalName: 'anim.gif',
        size: 512,
      },
      { storage },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('INVALID_MIME');
  });

  it('rejects file exceeding 5 MB with TOO_LARGE', async () => {
    const storage = new InMemoryStorageProvider();
    const bigSize = MAX_FILE_SIZE + 1;
    const result = await uploadImage(
      {
        buffer: makeBuffer(1024),
        mimeType: 'image/png',
        originalName: 'big.png',
        size: bigSize,
      },
      { storage },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('TOO_LARGE');
  });

  it('returns STORAGE_FAILURE when storage throws', async () => {
    const storage = new InMemoryStorageProvider();
    storage.upload = async () => { throw new Error('disk full'); };

    const result = await uploadImage(
      {
        buffer: makeBuffer(512),
        mimeType: 'image/webp',
        originalName: 'img.webp',
        size: 512,
      },
      { storage },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('STORAGE_FAILURE');
  });

  it('accepts image/avif', async () => {
    const storage = new InMemoryStorageProvider();
    const result = await uploadImage(
      { buffer: makeBuffer(256), mimeType: 'image/avif', originalName: 'img.avif', size: 256 },
      { storage },
    );
    expect(result.ok).toBe(true);
  });
});

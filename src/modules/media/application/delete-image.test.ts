import { describe, it, expect } from 'vitest';
import { deleteImage } from './delete-image';
import { InMemoryStorageProvider } from '../infrastructure/__fakes__/in-memory-storage-provider';

describe('deleteImage', () => {
  it('deletes an existing key and returns ok', async () => {
    const storage = new InMemoryStorageProvider();
    storage.seed('2024/01/abc.jpg', Buffer.from('data'));

    const result = await deleteImage({ key: '2024/01/abc.jpg' }, { storage });
    expect(result.ok).toBe(true);
    expect(await storage.exists('2024/01/abc.jpg')).toBe(false);
  });

  it('returns NOT_FOUND when key does not exist', async () => {
    const storage = new InMemoryStorageProvider();
    const result = await deleteImage({ key: 'nope/missing.jpg' }, { storage });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NOT_FOUND');
  });

  it('returns STORAGE_FAILURE when storage throws', async () => {
    const storage = new InMemoryStorageProvider();
    storage.seed('2024/01/abc.jpg', Buffer.from('data'));
    storage.delete = async () => { throw new Error('disk error'); };

    const result = await deleteImage({ key: '2024/01/abc.jpg' }, { storage });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('STORAGE_FAILURE');
  });
});

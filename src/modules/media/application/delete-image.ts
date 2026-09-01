import type { StorageProvider } from '../domain/storage-provider';
import { ok, err, type Result } from '@/shared/lib/result';

export type DeleteImageError = 'NOT_FOUND' | 'STORAGE_FAILURE';

export async function deleteImage(
  input: { key: string },
  deps: { storage: StorageProvider },
): Promise<Result<void, DeleteImageError>> {
  const exists = await deps.storage.exists(input.key);
  if (!exists) return err('NOT_FOUND');

  try {
    await deps.storage.delete(input.key);
    return ok(undefined);
  } catch {
    return err('STORAGE_FAILURE');
  }
}

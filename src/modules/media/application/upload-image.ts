import type { StorageProvider } from '../domain/storage-provider';
import { UploadImageSchema } from '../domain/media-schemas';
import { ok, err, type Result } from '@/shared/lib/result';

export type UploadImageError = 'INVALID_MIME' | 'TOO_LARGE' | 'STORAGE_FAILURE';

export interface UploadImageInput {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  size: number;
}

export interface UploadImageOutput {
  key: string;
  url: string;
  size: number;
}

export async function uploadImage(
  input: UploadImageInput,
  deps: { storage: StorageProvider },
): Promise<Result<UploadImageOutput, UploadImageError>> {
  const parsed = UploadImageSchema.safeParse({
    mimeType: input.mimeType,
    size: input.size,
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    if (firstIssue?.path[0] === 'size') return err('TOO_LARGE');
    return err('INVALID_MIME');
  }

  try {
    const output = await deps.storage.upload({
      buffer: input.buffer,
      mimeType: input.mimeType,
      originalName: input.originalName,
    });
    return ok(output);
  } catch {
    return err('STORAGE_FAILURE');
  }
}

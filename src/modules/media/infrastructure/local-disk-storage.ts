import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import type { StorageProvider, UploadInput, UploadOutput } from '../domain/storage-provider';
import { MIME_TO_EXT } from '../domain/media-schemas';
import type { AllowedMimeType } from '../domain/media-schemas';
import { env } from '@/shared/lib/env';

function getStorageRoot(): string {
  return env.STORAGE_ROOT;
}

function makeKey(mimeType: string): string {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const ext = MIME_TO_EXT[mimeType as AllowedMimeType] ?? 'jpg';
  const id = crypto.randomBytes(12).toString('hex');
  return `${yyyy}/${mm}/${id}.${ext}`;
}

export const localDiskStorage: StorageProvider = {
  async upload(input: UploadInput): Promise<UploadOutput> {
    const key = makeKey(input.mimeType);
    const root = getStorageRoot();
    const fullPath = path.join(root, key);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, input.buffer);

    return {
      key,
      url: `/api/media/${key}`,
      size: input.buffer.length,
    };
  },

  async delete(key: string): Promise<void> {
    const root = getStorageRoot();
    const fullPath = path.join(root, key);
    await fs.unlink(fullPath);
  },

  async exists(key: string): Promise<boolean> {
    const root = getStorageRoot();
    const fullPath = path.join(root, key);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  },
};

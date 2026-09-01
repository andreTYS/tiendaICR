import type { StorageProvider, UploadInput, UploadOutput } from '../../domain/storage-provider';

export class InMemoryStorageProvider implements StorageProvider {
  private store = new Map<string, { buffer: Buffer; mimeType: string; size: number }>();

  async upload(input: UploadInput): Promise<UploadOutput> {
    const key = `test/${Date.now()}-${input.originalName}`;
    this.store.set(key, {
      buffer: input.buffer,
      mimeType: input.mimeType,
      size: input.buffer.length,
    });
    return { key, url: `/api/media/${key}`, size: input.buffer.length };
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  /** Test helper */
  seed(key: string, buffer: Buffer, mimeType = 'image/jpeg'): void {
    this.store.set(key, { buffer, mimeType, size: buffer.length });
  }

  get size(): number {
    return this.store.size;
  }
}

export interface UploadInput {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

export interface UploadOutput {
  key: string;
  url: string;
  size: number;
}

export interface StorageProvider {
  upload(input: UploadInput): Promise<UploadOutput>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

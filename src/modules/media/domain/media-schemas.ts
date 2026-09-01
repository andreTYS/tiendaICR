import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const MIME_TO_EXT: Record<AllowedMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export const UploadImageSchema = z.object({
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  size: z.number().int().min(1).max(MAX_FILE_SIZE),
});

export type UploadImageValidation = z.infer<typeof UploadImageSchema>;

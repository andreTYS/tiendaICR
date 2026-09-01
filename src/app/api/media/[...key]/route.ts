import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { env } from '@/shared/lib/env';

/**
 * Valid key pattern — first line of defense against path traversal.
 * Accepts common storage layouts:
 *   - uploads:  2026/04/<cuid>.jpg                       (LocalDiskStorage)
 *   - seeds:    sample/project-aureo.jpg                 (seed script)
 *   - future:   any/nested/path/file.png
 *
 * Rules enforced:
 *   - each segment is alphanumeric + -_ (no ".." literal)
 *   - only one dot (before the extension)
 *   - extension limited to safe image formats
 *
 * Defense in depth: after this regex, the handler ALSO verifies via
 * path.resolve() that the resulting absolute path is still inside
 * STORAGE_ROOT, so even a bypass here cannot escape the sandbox.
 */
const KEY_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]*(?:\/[a-zA-Z0-9][a-zA-Z0-9_-]*)*\.(jpg|jpeg|png|webp|avif)$/;

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: segments } = await params;
  const key = segments.join('/');

  // Reject path traversal and invalid formats
  if (!KEY_RE.test(key)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const filePath = path.join(env.STORAGE_ROOT, key);

  // Safety: resolved path must stay inside storage root
  const root = path.resolve(env.STORAGE_ROOT);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }

  const ext = path.extname(key).slice(1).toLowerCase();
  const contentType = MIME_MAP[ext] ?? 'application/octet-stream';

  const stream = fs.createReadStream(filePath);
  const webStream = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk) =>
        controller.enqueue(
          typeof chunk === 'string' ? Buffer.from(chunk) : chunk,
        ),
      );
      stream.on('end', () => controller.close());
      stream.on('error', (err) => controller.error(err));
    },
    cancel() {
      stream.destroy();
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(stat.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

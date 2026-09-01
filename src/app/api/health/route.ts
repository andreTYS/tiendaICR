import { NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { access } from 'fs/promises';

export const dynamic = 'force-dynamic';

async function checkDb(): Promise<'up' | 'down'> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'up';
  } catch {
    return 'down';
  }
}

async function checkStorage(): Promise<'up' | 'down'> {
  try {
    const storageRoot = process.env.STORAGE_ROOT ?? './storage/uploads';
    await access(storageRoot);
    return 'up';
  } catch {
    return 'down';
  }
}

export async function GET() {
  const [db, storage] = await Promise.all([checkDb(), checkStorage()]);

  const status = db === 'up' ? 'ok' : 'degraded';

  return NextResponse.json(
    {
      status,
      db,
      storage,
      version: process.env.npm_package_version ?? '0.1.0',
      timestamp: new Date().toISOString(),
    },
    {
      status: status === 'ok' ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

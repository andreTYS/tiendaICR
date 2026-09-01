import type { MetadataRoute } from 'next';
import { listAllProjects } from '@/modules/projects/application/list-all-projects';
import { prismaProjectRepository } from '@/modules/projects/infrastructure/prisma-project-repository';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const staticRoutes = [
  { path: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
  { path: '/proyectos', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/servicios', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/calculadora', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/impacto', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/contacto', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/en', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/en/proyectos', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/en/servicios', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/en/calculadora', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/en/impacto', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/en/contacto', changeFrequency: 'monthly' as const, priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Dynamic project detail pages (active only)
  let projectEntries: MetadataRoute.Sitemap = [];
  try {
    const result = await listAllProjects({ repo: prismaProjectRepository });
    if (result.ok) {
      projectEntries = result.value
        .filter((p) => p.isActive)
        .flatMap((p) => [
        {
          url: `${BASE}/proyectos/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        },
        {
          url: `${BASE}/en/proyectos/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        },
      ]);
    }
  } catch {
    // Non-fatal — sitemap degrades gracefully without dynamic entries
  }

  return [...staticEntries, ...projectEntries];
}

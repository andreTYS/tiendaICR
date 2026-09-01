import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getProjectBySlug } from '@/modules/projects/application/get-project-by-slug';
import { listProjects } from '@/modules/projects/application/list-projects';
import { prismaCategoryRepository } from '@/modules/categories/infrastructure/prisma-category-repository';
import { prismaProjectRepository } from '@/modules/projects/infrastructure/prisma-project-repository';
import { prismaVictronSiteRepository } from '@/modules/victron/infrastructure/prisma-victron-site-repository';
import ProjectGallery from '@/modules/projects/presentation/public/project-gallery';
import LiveEnergyWidget from '@/modules/victron/presentation/public/live-energy-widget';
import { pickLocalized } from '@/shared/lib/i18n/pick-localized';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProjectBySlug({ slug }, { repo: prismaProjectRepository });
  if (!result.ok || result.value.type !== 'found') return {};
  const { project } = result.value;
  const title = `${project.titleEs} | ICR Proyectos`;
  const description = project.descEs.slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `/api/media/${project.mainImageKey}` }],
    },
  };
}

export default async function ProyectoDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getProjectBySlug({ slug }, { repo: prismaProjectRepository });

  if (!result.ok) notFound();

  if (result.value.type === 'aliased') {
    permanentRedirect(`/proyectos/${result.value.currentSlug}`);
  }

  const { project } = result.value;

  // Load category, related projects, and Victron link (if any) in parallel.
  const [category, relatedResult, victronSite] = await Promise.all([
    prismaCategoryRepository.findById(project.categoryId),
    listProjects({ categoryId: project.categoryId }, { repo: prismaProjectRepository }),
    prismaVictronSiteRepository.findByProjectId(project.id),
  ]);

  const related = relatedResult.ok
    ? relatedResult.value.filter((p) => p.id !== project.id).slice(0, 3)
    : [];

  const showLiveEnergy = Boolean(victronSite && victronSite.isPublicMetrics);

  const title = pickLocalized(project.titleEs, project.titleEn, 'es');
  const desc = pickLocalized(project.descEs, project.descEn, 'es');

  return (
    <main className="project-detail">
      {/* Breadcrumbs */}
      <nav className="project-detail-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link href="/proyectos">Proyectos</Link>
        <span aria-hidden="true">/</span>
        <span className="current">{title}</span>
      </nav>

      {/* Header */}
      {category && <div className="project-detail-eyebrow">{category.nameEs}</div>}
      <h1 className="project-detail-title display">{title}</h1>
      {project.location && (
        <span className="project-detail-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {project.location}
        </span>
      )}

      {/* Main image */}
      <div className="project-detail-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/media/${project.mainImageKey}`} alt={title} />
      </div>

      {/* Description */}
      <p className="project-detail-desc">{desc}</p>

      {/* Live energy widget — only when the project is linked to a Victron
          installation AND the admin enabled public metrics for it. */}
      {showLiveEnergy && (
        <LiveEnergyWidget slug={project.slug} source="public" />
      )}

      {/* Gallery */}
      {project.images.length > 0 && (
        <section className="project-detail-section">
          <h2>Galería</h2>
          <ProjectGallery images={project.images} projectTitle={title} />
        </section>
      )}

      {/* Related projects */}
      {related.length > 0 && (
        <section className="project-detail-section">
          <h2>Más proyectos</h2>
          <div className="project-detail-related">
            {related.map((p) => (
              <Link key={p.id} href={`/proyectos/${p.slug}`} className="project-detail-related-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/media/${p.mainImageKey}`} alt={p.titleEs} />
                <div className="title">{p.titleEs}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

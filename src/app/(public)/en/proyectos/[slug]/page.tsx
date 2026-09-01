import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getProjectBySlug } from '@/modules/projects/application/get-project-by-slug';
import { listProjects } from '@/modules/projects/application/list-projects';
import { prismaCategoryRepository } from '@/modules/categories/infrastructure/prisma-category-repository';
import { prismaProjectRepository } from '@/modules/projects/infrastructure/prisma-project-repository';
import ProjectGallery from '@/modules/projects/presentation/public/project-gallery';
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
  const title = pickLocalized(project.titleEs, project.titleEn, 'en');
  const description = pickLocalized(project.descEs, project.descEn, 'en').slice(0, 160);
  return {
    title: `${title} | ICR Projects`,
    description,
    openGraph: {
      title: `${title} | ICR Projects`,
      description,
      images: [{ url: `/api/media/${project.mainImageKey}` }],
    },
  };
}

export default async function ProyectoDetailEnPage({ params }: Props) {
  const { slug } = await params;
  const result = await getProjectBySlug({ slug }, { repo: prismaProjectRepository });

  if (!result.ok) notFound();

  if (result.value.type === 'aliased') {
    permanentRedirect(`/en/proyectos/${result.value.currentSlug}`);
  }

  const { project } = result.value;

  const [category, relatedResult] = await Promise.all([
    prismaCategoryRepository.findById(project.categoryId),
    listProjects({ categoryId: project.categoryId }, { repo: prismaProjectRepository }),
  ]);

  const related = relatedResult.ok
    ? relatedResult.value.filter((p) => p.id !== project.id).slice(0, 3)
    : [];

  const title = pickLocalized(project.titleEs, project.titleEn, 'en');
  const desc = pickLocalized(project.descEs, project.descEn, 'en');
  const categoryName = category ? pickLocalized(category.nameEs, category.nameEn, 'en') : null;

  return (
    <main className="project-detail">
      <nav className="project-detail-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/en">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/en/proyectos">Projects</Link>
        <span aria-hidden="true">/</span>
        <span className="current">{title}</span>
      </nav>

      {categoryName && <div className="project-detail-eyebrow">{categoryName}</div>}
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

      <div className="project-detail-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/media/${project.mainImageKey}`} alt={title} />
      </div>

      <p className="project-detail-desc">{desc}</p>

      {project.images.length > 0 && (
        <section className="project-detail-section">
          <h2>Gallery</h2>
          <ProjectGallery images={project.images} projectTitle={title} />
        </section>
      )}

      {related.length > 0 && (
        <section className="project-detail-section">
          <h2>More projects</h2>
          <div className="project-detail-related">
            {related.map((p) => (
              <Link key={p.id} href={`/en/proyectos/${p.slug}`} className="project-detail-related-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/media/${p.mainImageKey}`} alt={pickLocalized(p.titleEs, p.titleEn, 'en')} />
                <div className="title">{pickLocalized(p.titleEs, p.titleEn, 'en')}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

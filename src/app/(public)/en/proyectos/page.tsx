import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getDictionary } from '@/shared/lib/i18n/get-dictionary';
import PageHeader from '@/shared/ui/templates/page-header';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Solar project portfolio in Peru: mining, government, private enterprise, hotels, agribusiness and residential.',
  openGraph: { title: 'Projects | Inversiones ICR', locale: 'en_US' },
};
import { listProjects } from '@/modules/projects/application/list-projects';
import { listCategories } from '@/modules/categories/application/list-categories';
import { prismaProjectRepository } from '@/modules/projects/infrastructure/prisma-project-repository';
import { prismaCategoryRepository } from '@/modules/categories/infrastructure/prisma-category-repository';
import ProjectCard from '@/modules/projects/presentation/public/project-card';
import ProjectFilter from '@/modules/projects/presentation/public/project-filter';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ cat?: string }>;
}

export default async function ProyectosEnPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const dict = getDictionary('en');

  let categoryId: string | undefined;
  if (cat) {
    const catResult = await prismaCategoryRepository.findBySlug(cat);
    categoryId = catResult?.id;
  }

  const [projectsResult, categoriesResult] = await Promise.all([
    listProjects({ categoryId }, { repo: prismaProjectRepository }),
    listCategories({ repo: prismaCategoryRepository }),
  ]);

  const projects = projectsResult.ok ? projectsResult.value : [];
  const categories = categoriesResult.ok ? categoriesResult.value : [];

  return (
    <>
      <PageHeader
        locale="en"
        route="proyectos"
        eyebrow={dict.proyectos.eyebrow}
        title='Projects running <span class="hl">every day</span>.'
        lead={dict.proyectos.lead}
      />

      <section id="proyectos" className="proyectos theme-dark" data-screen-label="05 Projects">
        <div className="container">
          <Suspense>
            <ProjectFilter categories={categories} locale="en" basePath="/en/proyectos" />
          </Suspense>

          {projects.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '3rem 0' }}>
              No projects in this category yet.
            </p>
          ) : (
            <div className="proyectos-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} locale="en" basePath="/en/proyectos" />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

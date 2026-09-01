import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getDictionary } from '@/shared/lib/i18n/get-dictionary';

export const metadata: Metadata = {
  title: 'Proyectos',
  description:
    'Portafolio de proyectos de energía solar en Perú: minería, gobierno, empresa privada, hoteles, agroindustria y residencial.',
  openGraph: { title: 'Proyectos | Inversiones ICR', locale: 'es_PE' },
};
import PageHeader from '@/shared/ui/templates/page-header';
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

export default async function ProyectosPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const dict = getDictionary('es');

  // Translate category slug → id for filtering
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
        locale="es"
        route="proyectos"
        eyebrow={dict.proyectos.eyebrow}
        title='Proyectos que <span class="hl">operan hoy</span>.'
        lead={dict.proyectos.lead}
      />

      <section id="proyectos" className="proyectos theme-dark" data-screen-label="05 Proyectos">
        <div className="container">
          <Suspense>
            <ProjectFilter categories={categories} locale="es" basePath="/proyectos" />
          </Suspense>

          {projects.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '3rem 0' }}>
              No hay proyectos en esta categoría todavía.
            </p>
          ) : (
            <div className="proyectos-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} locale="es" basePath="/proyectos" />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

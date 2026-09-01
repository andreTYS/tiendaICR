import Link from 'next/link';
import type { Project } from '../../domain/project';

interface Props {
  project: Project;
  locale: 'es' | 'en';
  basePath: string; // '/proyectos' or '/en/proyectos'
}

export default function ProjectCard({ project, locale, basePath }: Props) {
  const title = locale === 'en' && project.titleEn ? project.titleEn : project.titleEs;

  return (
    <article className="proyecto-card reveal" role="article">
      <Link href={`${basePath}/${project.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div className="proyecto-visual">
          <img
            src={`/api/media/${project.mainImageKey}`}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="proyecto-overlay" />
        <div className="proyecto-info">
          <div className="proyecto-tag">{project.location ?? ''}</div>
          <div className="proyecto-title">{title}</div>
        </div>
      </Link>
    </article>
  );
}

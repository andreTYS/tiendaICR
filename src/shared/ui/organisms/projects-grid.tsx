'use client';
import { useState } from 'react';
import SplitHeading from '@/shared/ui/atoms/split-heading';
import ProjectVisual from '@/shared/ui/organisms/project-visual';
import Icon from '@/shared/ui/organisms/icon';
import type { Dictionary } from '@/shared/lib/i18n/get-dictionary';

interface Props {
  dict: Pick<Dictionary, 'proyectos'>;
}

export default function ProjectsGrid({ dict }: Props) {
  const { proyectos } = dict;
  const [filter, setFilter] = useState(0);

  const filtered = proyectos.list.filter((p) => {
    if (filter === 0) return true;
    const f = proyectos.filters[filter].toLowerCase();
    return p.tag.toLowerCase().includes(f) || p.sector.toLowerCase().includes(f);
  });

  return (
    <section id="proyectos" className="proyectos theme-dark" data-screen-label="05 Proyectos">
      <div className="container">
        <div className="proyectos-header">
          <div>
            <div className="eyebrow reveal">{proyectos.eyebrow}</div>
            <SplitHeading as="h2" className="display reveal" data-delay="1" style={{ marginTop: 20 }}>
              {proyectos.title}
            </SplitHeading>
            <p className="lead reveal" data-delay="2" style={{ marginTop: 16 }}>
              {proyectos.lead}
            </p>
          </div>
          <div className="proyectos-filters reveal" data-delay="2">
            {proyectos.filters.map((f, i) => (
              <button
                key={i}
                className={`filter-btn ${filter === i ? 'active' : ''}`}
                onClick={() => setFilter(i)}
                type="button"
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="proyectos-grid">
          {filtered.map((p, i) => (
            <article
              key={p.id}
              className="proyecto-card reveal"
              data-delay={Math.min(i, 5)}
              // Phase 3 will wire this to a modal/detail route
              role="article"
            >
              <div className="proyecto-visual">
                <ProjectVisual palette={p.visualPalette} index={i} />
              </div>
              <div className="proyecto-overlay" />
              <div className="proyecto-arrow">
                <Icon name="arrow" size={16} />
              </div>
              <div className="proyecto-info">
                <div className="proyecto-tag">{p.tag}</div>
                <div className="proyecto-title">{p.title}</div>
                <div className="proyecto-meta">
                  <span>{p.year}</span>
                  <span className="sep" />
                  <span>{p.capacity}</span>
                  <span className="sep" />
                  <span style={{ color: 'var(--accent)' }}>{p.saving}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Category } from '@/modules/categories/domain/category';

interface Props {
  categories: Category[];
  locale: 'es' | 'en';
  basePath: string;
}

export default function ProjectFilter({ categories, locale, basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('cat') ?? '';

  function setFilter(slug: string) {
    const url = slug ? `${basePath}?cat=${slug}` : basePath;
    router.push(url);
  }

  const allLabel = locale === 'en' ? 'All' : 'Todos';

  return (
    <div className="proyectos-filters reveal" data-delay="2">
      <button
        className={`filter-btn ${!current ? 'active' : ''}`}
        onClick={() => setFilter('')}
        type="button"
      >
        {allLabel}
      </button>
      {categories.map((cat) => {
        const label = locale === 'en' && cat.nameEn ? cat.nameEn : cat.nameEs;
        return (
          <button
            key={cat.id}
            className={`filter-btn ${current === cat.slug ? 'active' : ''}`}
            onClick={() => setFilter(cat.slug)}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

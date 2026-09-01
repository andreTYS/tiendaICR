import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// ── Repo mocks (prevent Prisma from loading) ──────────────────────────────────
vi.mock('@/modules/projects/infrastructure/prisma-project-repository', () => ({
  prismaProjectRepository: {},
}));
vi.mock('@/modules/categories/infrastructure/prisma-category-repository', () => ({
  prismaCategoryRepository: { findBySlug: vi.fn().mockResolvedValue(null) },
}));

// ── Use-case mocks ─────────────────────────────────────────────────────────────
vi.mock('@/modules/projects/application/list-projects', () => ({
  listProjects: vi.fn().mockResolvedValue({ ok: true, value: [] }),
}));
vi.mock('@/modules/categories/application/list-categories', () => ({
  listCategories: vi.fn().mockResolvedValue({ ok: true, value: [] }),
}));

// ── Presentation mocks ─────────────────────────────────────────────────────────
vi.mock('@/modules/projects/presentation/public/project-filter', () => ({
  default: () => <div data-testid="project-filter" />,
}));
vi.mock('@/modules/projects/presentation/public/project-card', () => ({
  default: () => <div data-testid="project-card" />,
}));
vi.mock('@/shared/ui/templates/page-header', () => ({
  default: ({ children }: { children?: React.ReactNode }) => (
    <div><h1>Proyectos</h1>{children}</div>
  ),
}));

import ProyectosPage from './page';
import ProyectosEnPage from '../en/proyectos/page';

describe('Proyectos public page', () => {
  it('ES: renders without crashing and shows H1', async () => {
    const jsx = await ProyectosPage({ searchParams: {} });
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('EN: renders without crashing and shows H1', async () => {
    const jsx = await ProyectosEnPage({ searchParams: {} });
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});

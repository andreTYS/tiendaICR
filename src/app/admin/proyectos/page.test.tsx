import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// ── Repo mocks ────────────────────────────────────────────────────────────────
vi.mock('@/modules/projects/infrastructure/prisma-project-repository', () => ({
  prismaProjectRepository: {},
}));
vi.mock('@/modules/categories/infrastructure/prisma-category-repository', () => ({
  prismaCategoryRepository: {},
}));

// ── Use-case mocks ────────────────────────────────────────────────────────────
vi.mock('@/modules/projects/application/list-all-projects', () => ({
  listAllProjects: vi.fn().mockResolvedValue({ ok: true, value: [] }),
}));
vi.mock('@/modules/categories/application/list-categories', () => ({
  listCategories: vi.fn().mockResolvedValue({ ok: true, value: [] }),
}));

// ── Child component mocks (avoid DnD-kit in jsdom) ───────────────────────────
vi.mock('@/modules/projects/presentation/admin/project-table', () => ({
  default: () => <div data-testid="project-table" />,
}));

import AdminProyectosPage from './page';

describe('Admin Proyectos list page', () => {
  it('renders heading and "Nuevo proyecto" link when empty', async () => {
    const jsx = await AdminProyectosPage();
    render(jsx);
    expect(screen.getByRole('heading', { level: 1, name: /proyectos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /nuevo proyecto/i })).toBeInTheDocument();
  });
});

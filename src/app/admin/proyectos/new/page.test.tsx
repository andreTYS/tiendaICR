import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// ── Repo mocks ────────────────────────────────────────────────────────────────
vi.mock('@/modules/categories/infrastructure/prisma-category-repository', () => ({
  prismaCategoryRepository: {},
}));

// ── Use-case mocks ────────────────────────────────────────────────────────────
vi.mock('@/modules/categories/application/list-categories', () => ({
  listCategories: vi.fn().mockResolvedValue({ ok: true, value: [] }),
}));

// ── Server action mock ────────────────────────────────────────────────────────
vi.mock('@/app/actions/projects', () => ({
  createProjectAction: vi.fn(),
}));

// ── Child component mocks ─────────────────────────────────────────────────────
vi.mock('@/modules/projects/presentation/admin/project-form', () => ({
  default: () => <form data-testid="project-form" />,
}));

import NewProyectoPage from './page';

describe('Admin Proyectos new page', () => {
  it('renders heading and back link', async () => {
    const jsx = await NewProyectoPage();
    render(jsx);
    expect(screen.getByRole('heading', { level: 1, name: /nuevo proyecto/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /proyectos/i })).toBeInTheDocument();
  });
});

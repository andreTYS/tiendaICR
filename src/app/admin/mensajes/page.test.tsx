import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/modules/contact/application/list-contact-messages', () => ({
  listContactMessages: vi.fn().mockResolvedValue({ ok: true, value: [] }),
}));
vi.mock('@/modules/contact/infrastructure/prisma-contact-repository', () => ({
  prismaContactRepository: {},
}));
vi.mock('./mensajes-table', () => ({
  default: () => <div data-testid="mensajes-table">table</div>,
}));

describe('AdminMensajesPage smoke', () => {
  it('renders empty state when no messages', async () => {
    const { default: Page } = await import('./page');
    const jsx = await Page();
    render(jsx);
    expect(screen.getByText(/mensajes de contacto/i)).toBeDefined();
    expect(screen.getByText(/0 mensajes recibidos/i)).toBeDefined();
  });
});

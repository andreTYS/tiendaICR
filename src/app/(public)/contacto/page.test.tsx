import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the contact server action to prevent Prisma from loading in jsdom
vi.mock('@/app/actions/contact', () => ({
  submitContact: vi.fn().mockResolvedValue({ success: true }),
  markContactAsReadAction: vi.fn(),
  deleteContactAction: vi.fn(),
}));

// Mock the site-contact prisma repo so the async page can render without a DB
vi.mock('@/modules/site-contact/infrastructure/prisma-site-contact-repository', () => ({
  prismaSiteContactRepository: {
    get: vi.fn().mockResolvedValue({
      id: 1,
      phone: '',
      whatsapp: '',
      email: '',
      addressLine: '',
      addressCity: '',
      cities: '',
      instagramUrl: '',
      facebookUrl: '',
      linkedinUrl: '',
      tiktokUrl: '',
      youtubeUrl: '',
      twitterUrl: '',
      updatedAt: new Date(),
    }),
    update: vi.fn(),
  },
}));

import ContactoPage from './page';
import ContactoEnPage from '../en/contacto/page';

describe('Contacto page', () => {
  it('ES: renders H1', async () => {
    const ui = await ContactoPage();
    render(ui);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('EN: renders H1', async () => {
    const ui = await ContactoEnPage();
    render(ui);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});

// NOTE: `dynamic = 'force-dynamic'` lives on each page that actually reads
// Prisma (/, /proyectos, /proyectos/[slug], and their /en mirrors). Static
// pages (servicios, calculadora, impacto, contacto) can render normally.
// Setting it on the layout caused a Next.js 16 + Turbopack RSC issue where
// client-side navigation returned empty payloads until a hard refresh.

import type { ReactNode } from 'react';
import Nav from '@/shared/ui/organisms/nav';
import Footer from '@/shared/ui/organisms/footer';
import ScrollProgress from '@/shared/ui/molecules/scroll-progress';
import RevealObserver from '@/shared/ui/templates/reveal-observer';
import { getSiteContact } from '@/modules/site-contact/application/get-site-contact';
import { prismaSiteContactRepository } from '@/modules/site-contact/infrastructure/prisma-site-contact-repository';
import type { SiteContact } from '@/modules/site-contact/domain/site-contact';

/**
 * Public layout — applies to all routes in (public) group:
 *   / /servicios /proyectos /calculadora /impacto /contacto
 *   /en /en/servicios … etc.
 *
 * Nav and Footer are "use client" and derive locale from usePathname()
 * so this layout needs no locale awareness itself. Footer receives the
 * SiteContact singleton so the admin can edit phone/email/socials live.
 */
export default async function PublicLayout({ children }: { children: ReactNode }) {
  // Tolerate build-time prerender (no DB) and transient DB errors — Footer
  // falls back to the i18n dictionary when contact is null, so the page
  // never blanks out.
  let contact: SiteContact | null = null;
  if (process.env.DATABASE_URL) {
    try {
      const result = await getSiteContact({ repo: prismaSiteContactRepository });
      if (result.ok) contact = result.value;
    } catch {
      contact = null;
    }
  }

  return (
    <>
      <ScrollProgress />
      <Nav />
      <RevealObserver />
      <main>{children}</main>
      <Footer contact={contact} />
    </>
  );
}

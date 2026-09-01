import type { Metadata } from 'next';
import { getDictionary } from '@/shared/lib/i18n/get-dictionary';
import PageHeader from '@/shared/ui/templates/page-header';
import Contacto from '@/shared/ui/organisms/contacto';
import { getSiteContact } from '@/modules/site-contact/application/get-site-contact';
import { prismaSiteContactRepository } from '@/modules/site-contact/infrastructure/prisma-site-contact-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'An engineer visits you, assesses real consumption and delivers a technical proposal in 72 hours.',
  openGraph: { title: 'Contact | Inversiones ICR', locale: 'en_US' },
};

export default async function ContactoEnPage() {
  const dict = getDictionary('en');
  const contactResult = await getSiteContact({ repo: prismaSiteContactRepository });
  const contact = contactResult.ok ? contactResult.value : null;

  return (
    <>
      <PageHeader
        locale="en"
        route="contacto"
        eyebrow={dict.contacto.eyebrow}
        title='Your next installation <span class="hl">starts here</span>.'
        lead={dict.contacto.lead}
      />
      <Contacto dict={dict} contact={contact} />
    </>
  );
}

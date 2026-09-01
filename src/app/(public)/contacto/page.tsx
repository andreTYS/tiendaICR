import type { Metadata } from 'next';
import { getDictionary } from '@/shared/lib/i18n/get-dictionary';
import PageHeader from '@/shared/ui/templates/page-header';
import Contacto from '@/shared/ui/organisms/contacto';
import { getSiteContact } from '@/modules/site-contact/application/get-site-contact';
import { prismaSiteContactRepository } from '@/modules/site-contact/infrastructure/prisma-site-contact-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contáctanos para instalar paneles solares en tu hogar, empresa o industria. Asesoría gratuita y sin compromiso.',
  openGraph: { title: 'Contacto | Inversiones ICR', locale: 'es_PE' },
};

export default async function ContactoPage() {
  const dict = getDictionary('es');
  const contactResult = await getSiteContact({ repo: prismaSiteContactRepository });
  const contact = contactResult.ok ? contactResult.value : null;

  return (
    <>
      <PageHeader
        locale="es"
        route="contacto"
        eyebrow={dict.contacto.eyebrow}
        title='Tu próxima instalación <span class="hl">empieza aquí</span>.'
        lead={dict.contacto.lead}
      />
      <Contacto dict={dict} contact={contact} />
    </>
  );
}

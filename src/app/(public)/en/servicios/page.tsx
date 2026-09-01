import type { Metadata } from 'next';
import { getDictionary } from '@/shared/lib/i18n/get-dictionary';
import PageHeader from '@/shared/ui/templates/page-header';
import Servicios from '@/shared/ui/organisms/servicios';

export const metadata: Metadata = {
  title: 'Solar services',
  description:
    'Five integrated disciplines: design, installation, monitoring, maintenance and financing of solar systems in Peru.',
  openGraph: { title: 'Solar services | Inversiones ICR', locale: 'en_US' },
};

export default function ServiciosEnPage() {
  const dict = getDictionary('en');
  return (
    <>
      <PageHeader
        locale="en"
        route="servicios"
        eyebrow={dict.servicios.eyebrow}
        title='The full solar lifecycle, <span class="hl">under one roof</span>.'
        lead="Five integrated disciplines working together from the first kWh to the third decade of your system."
      />
      <Servicios dict={dict} />
    </>
  );
}

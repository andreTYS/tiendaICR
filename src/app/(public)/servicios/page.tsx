import type { Metadata } from 'next';
import { getDictionary } from '@/shared/lib/i18n/get-dictionary';
import PageHeader from '@/shared/ui/templates/page-header';
import Servicios from '@/shared/ui/organisms/servicios';

export const metadata: Metadata = {
  title: 'Servicios solares',
  description:
    'Cinco disciplinas integradas: diseño, instalación, monitoreo, mantenimiento y financiamiento de sistemas solares en Perú.',
  openGraph: { title: 'Servicios solares | Inversiones ICR', locale: 'es_PE' },
};

export default function ServiciosPage() {
  const dict = getDictionary('es');
  return (
    <>
      <PageHeader
        locale="es"
        route="servicios"
        eyebrow={dict.servicios.eyebrow}
        title='Todo el ciclo solar <span class="hl">bajo un mismo techo</span>.'
        lead="Cinco disciplinas integradas que trabajan juntas desde el primer kWh hasta la década treinta de tu sistema."
      />
      <Servicios dict={dict} />
    </>
  );
}

import type { Metadata } from 'next';
import { getDictionary } from '@/shared/lib/i18n/get-dictionary';
import PageHeader from '@/shared/ui/templates/page-header';
import Impacto from '@/shared/ui/organisms/impacto';
import Seguridad from '@/shared/ui/organisms/seguridad';

export const metadata: Metadata = {
  title: 'Impacto ambiental',
  description:
    'Cada kWh solar cuenta. Conoce el impacto ambiental y social de los proyectos de Inversiones ICR en Perú.',
  openGraph: { title: 'Impacto ambiental | Inversiones ICR', locale: 'es_PE' },
};

export default function ImpactoPage() {
  const dict = getDictionary('es');
  return (
    <>
      <PageHeader
        locale="es"
        route="impacto"
        eyebrow={dict.impacto.eyebrow}
        title='Cada <span class="hl">kWh</span> cuenta.'
        lead={dict.impacto.lead}
      />
      <Impacto dict={dict} />
      <Seguridad dict={dict} />
    </>
  );
}

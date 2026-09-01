import type { Metadata } from 'next';
import { getDictionary } from '@/shared/lib/i18n/get-dictionary';
import PageHeader from '@/shared/ui/templates/page-header';
import Impacto from '@/shared/ui/organisms/impacto';
import Seguridad from '@/shared/ui/organisms/seguridad';

export const metadata: Metadata = {
  title: 'Environmental impact',
  description:
    'Every kWh counts. 28,420 t CO₂ avoided since 2014. AI IP cameras integrated into the same dashboard.',
  openGraph: { title: 'Impact | Inversiones ICR', locale: 'en_US' },
};

export default function ImpactoEnPage() {
  const dict = getDictionary('en');
  return (
    <>
      <PageHeader
        locale="en"
        route="impacto"
        eyebrow={dict.impacto.eyebrow}
        title='Every <span class="hl">kWh</span> counts.'
        lead={dict.impacto.lead}
      />
      <Impacto dict={dict} />
      <Seguridad dict={dict} />
    </>
  );
}

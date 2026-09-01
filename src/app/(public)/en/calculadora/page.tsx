import type { Metadata } from 'next';
import { getDictionary } from '@/shared/lib/i18n/get-dictionary';
import PageHeader from '@/shared/ui/templates/page-header';
import Calculator from '@/shared/ui/organisms/calculator';

export const metadata: Metadata = {
  title: 'Savings calculator',
  description:
    'Interactive simulator. Adjust your bill and coverage, see investment, ROI and avoided CO₂ in real time.',
  openGraph: { title: 'Savings calculator | Inversiones ICR', locale: 'en_US' },
};

export default function CalculadoraEnPage() {
  const dict = getDictionary('en');
  return (
    <>
      <PageHeader
        locale="en"
        route="calculadora"
        eyebrow={dict.calc.eyebrow}
        title='How much would you save with <span class="hl">your own energy</span>?'
        lead={dict.calc.lead}
      />
      <Calculator dict={dict} />
    </>
  );
}

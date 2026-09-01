import type { Metadata } from 'next';
import { getDictionary } from '@/shared/lib/i18n/get-dictionary';
import PageHeader from '@/shared/ui/templates/page-header';
import Calculator from '@/shared/ui/organisms/calculator';

export const metadata: Metadata = {
  title: 'Calculadora solar',
  description:
    'Calcula cuánto puedes ahorrar instalando paneles solares. Ingresa tu consumo y obtén una estimación personalizada.',
  openGraph: { title: 'Calculadora solar | Inversiones ICR', locale: 'es_PE' },
};

export default function CalculadoraPage() {
  const dict = getDictionary('es');
  return (
    <>
      <PageHeader
        locale="es"
        route="calculadora"
        eyebrow={dict.calc.eyebrow}
        title='¿Cuánto ahorrarías con <span class="hl">energía propia</span>?'
        lead={dict.calc.lead}
      />
      <Calculator dict={dict} />
    </>
  );
}

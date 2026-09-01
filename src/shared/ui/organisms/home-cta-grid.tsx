// RSC — Home CTA Grid (6 cards linking to internal pages)
// 1:1 port from page-home.jsx#HomeCTAGrid

import Link from 'next/link';
import Icon from '@/shared/ui/organisms/icon';
import type { Locale } from '@/shared/lib/i18n/types';

interface Props {
  locale: Locale;
}

const CARDS = {
  es: [
    {
      n: '01',
      key: 'servicios',
      href: '/servicios',
      title: 'Soluciones integrales',
      desc: 'Instalación, mantenimiento, monitoreo 24/7 y consultoría energética. Todo el ciclo solar bajo un mismo techo.',
      go: 'Ver servicios',
    },
    {
      n: '02',
      key: 'proyectos',
      href: '/proyectos',
      title: 'Proyectos reales',
      desc: 'Desde plantas mineras de 2.4 MW hasta hogares que llevan su factura a cero. Cada caso medido y auditado.',
      go: 'Ver portafolio',
    },
    {
      n: '03',
      key: 'calculadora',
      href: '/calculadora',
      title: 'Calcula tu ahorro',
      desc: 'Simulador interactivo. Ajusta tu recibo y cobertura, visualiza inversión, ROI y CO₂ evitado en tiempo real.',
      go: 'Abrir calculadora',
    },
    {
      n: '04',
      key: 'impacto',
      href: '/impacto',
      title: 'Impacto + Seguridad',
      desc: '28,420 t CO₂ evitadas desde 2014. Además, cámaras IP con IA integradas al mismo dashboard.',
      go: 'Explorar impacto',
    },
    {
      n: '05',
      key: 'contacto',
      href: '/contacto',
      title: 'Agenda una visita',
      desc: 'Un ingeniero te visita, evalúa consumo real y entrega propuesta técnica en 72h.',
      go: 'Contactar',
    },
    {
      n: '06',
      key: 'manifiesto',
      href: '/servicios',
      title: 'Nuestra visión',
      desc: 'Impulsamos la transición energética de Perú con ingeniería local y tecnología de nivel mundial.',
      go: 'Saber más',
    },
  ],
  en: [
    {
      n: '01',
      key: 'servicios',
      href: '/en/servicios',
      title: 'End-to-end solutions',
      desc: 'Installation, maintenance, 24/7 monitoring and energy consulting. The full solar lifecycle under one roof.',
      go: 'View services',
    },
    {
      n: '02',
      key: 'proyectos',
      href: '/en/proyectos',
      title: 'Real projects',
      desc: 'From 2.4 MW mining plants to homes with zero bills. Every case measured and audited.',
      go: 'See portfolio',
    },
    {
      n: '03',
      key: 'calculadora',
      href: '/en/calculadora',
      title: 'Calculate your savings',
      desc: 'Interactive simulator. Adjust your bill and coverage, see investment, ROI and avoided CO₂ in real time.',
      go: 'Open calculator',
    },
    {
      n: '04',
      key: 'impacto',
      href: '/en/impacto',
      title: 'Impact + Security',
      desc: '28,420 t CO₂ avoided since 2014. Plus AI IP cameras integrated into the same dashboard.',
      go: 'Explore impact',
    },
    {
      n: '05',
      key: 'contacto',
      href: '/en/contacto',
      title: 'Book a visit',
      desc: 'An engineer visits you, assesses real consumption and delivers a technical proposal in 72h.',
      go: 'Contact',
    },
    {
      n: '06',
      key: 'manifiesto',
      href: '/en/servicios',
      title: 'Our vision',
      desc: "Driving Peru's energy transition with local engineering and world-class technology.",
      go: 'Learn more',
    },
  ],
} as const;

export default function HomeCTAGrid({ locale }: Props) {
  const cards = CARDS[locale];
  const eyebrow = locale === 'es' ? 'Explora' : 'Explore';
  const heading = locale === 'es' ? 'Todo lo que hacemos, organizado.' : 'Everything we do, organized.';
  const lead =
    locale === 'es'
      ? 'Seis páginas, un propósito: diseñar, construir y operar sistemas solares que pagan solos y duran décadas.'
      : 'Six pages, one purpose: design, build and operate solar systems that pay themselves back and last decades.';

  return (
    <section className="home-cta theme-dark">
      <div className="container">
        <div className="home-cta-header">
          <div>
            <div className="eyebrow reveal">{eyebrow}</div>
            <h2
              className="display reveal"
              data-delay="1"
              style={{ marginTop: 20, fontSize: 'clamp(40px, 5vw, 72px)' }}
            >
              {heading}
            </h2>
          </div>
          <p className="lead reveal" data-delay="2">
            {lead}
          </p>
        </div>
        <div className="home-cta-grid">
          {cards.map((c, i) => (
            <Link
              key={c.key}
              href={c.href}
              className="home-cta-card reveal"
              data-delay={Math.min(i, 5)}
            >
              <div className="num">{c.n}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <div className="go">
                {c.go} <Icon name="arrow" size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

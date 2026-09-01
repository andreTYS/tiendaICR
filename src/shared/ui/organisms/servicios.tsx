'use client';
import { useEffect, useRef, useState } from 'react';
import SplitHeading from '@/shared/ui/atoms/split-heading';
import ServiceVisual from '@/shared/ui/organisms/service-visual';
import type { Dictionary } from '@/shared/lib/i18n/get-dictionary';

interface Props {
  dict: Pick<Dictionary, 'servicios'>;
}

export default function Servicios({ dict }: Props) {
  const { servicios } = dict;
  const items = servicios.items;
  const [active, setActive] = useState(0);
  const [fill, setFill] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.max(0, Math.min(total, -rect.top));
      const progress = total > 0 ? scrolled / total : 0;
      const segment = 1 / items.length;
      const idx = Math.min(items.length - 1, Math.floor(progress / segment));
      const innerProg = (progress - idx * segment) / segment;
      setActive(idx);
      setFill(innerProg);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [items.length]);

  return (
    <section id="servicios" className="servicios theme-dark" data-screen-label="03 Servicios">
      <div className="servicios-header">
        <div className="eyebrow reveal">{servicios.eyebrow}</div>
        <SplitHeading as="h2" className="display reveal" data-delay="1" style={{ marginTop: 24 }}>
          {servicios.title}
        </SplitHeading>
      </div>
      <div
        className="servicios-scroll"
        ref={scrollRef}
        style={{ height: `${items.length * 100}vh` }}
      >
        <div className="servicios-sticky">
          <div className="servicios-inner">
            <div className="servicios-visual">
              {items.map((_item, i) => (
                <div key={i} className={`servicio-visual ${i === active ? 'active' : ''}`}>
                  <ServiceVisual index={i} />
                </div>
              ))}
            </div>
            <div className="servicios-text" style={{ minHeight: 420 }}>
              {items.map((item, i) => (
                <div key={i} className={`servicio-text ${i === active ? 'active' : ''}`}>
                  <div className="servicio-number">{item.n} / 05</div>
                  <h3 className="servicio-title">{item.t}</h3>
                  <p className="servicio-desc">{item.d}</p>
                  <div className="servicio-features">
                    {item.f.map((f, j) => (
                      <span key={j} className="servicio-feature">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="servicios-progress">
            {items.map((_, i) => (
              <div key={i} className="progress-dot">
                <span
                  className="fill"
                  style={{
                    width: i < active ? '100%' : i === active ? `${fill * 100}%` : '0%',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

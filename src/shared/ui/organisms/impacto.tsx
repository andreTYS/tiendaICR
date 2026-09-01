'use client';
import { useEffect, useRef } from 'react';
import SplitHeading from '@/shared/ui/atoms/split-heading';
import type { Dictionary } from '@/shared/lib/i18n/get-dictionary';

interface Props {
  dict: Pick<Dictionary, 'impacto'>;
}

function animateLargeCounter(el: HTMLElement, target: number, duration = 2000) {
  const start = performance.now();
  function step(now: number) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 4);
    const v = target * eased;
    el.textContent = target >= 1000 ? Math.round(v).toLocaleString() : v.toFixed(1);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export default function Impacto({ dict }: Props) {
  const { impacto } = dict;
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            impacto.items.forEach((item, i) => {
              const el = refs.current[i];
              if (el) animateLargeCounter(el, item.v);
            });
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, [impacto]);

  return (
    <section id="impacto" className="impacto theme-dark" ref={sectionRef} data-screen-label="06 Impacto">
      <div className="container">
        <div className="impacto-content">
          <div className="eyebrow reveal" style={{ justifyContent: 'center' }}>
            {impacto.eyebrow}
          </div>
          <SplitHeading as="h2" className="display reveal" data-delay="1">
            {impacto.title}
          </SplitHeading>
          <p className="lead reveal" data-delay="2">
            {impacto.lead}
          </p>
          <div className="impacto-numbers reveal" data-delay="3">
            {impacto.items.map((item, i) => (
              <div className="impacto-num" key={i}>
                <div className="impacto-num-value">
                  <span ref={(el) => { refs.current[i] = el; }}>0</span>
                  <span className="unit">{item.u}</span>
                </div>
                <div className="impacto-num-label">{item.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

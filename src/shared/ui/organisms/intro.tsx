'use client';
import { useEffect, useRef } from 'react';
import SplitHeading from '@/shared/ui/atoms/split-heading';
import type { Dictionary } from '@/shared/lib/i18n/get-dictionary';

interface Props {
  dict: Pick<Dictionary, 'intro'>;
}

function animateCounter(el: HTMLElement, target: string, duration = 1400) {
  // Only animate purely numeric values (skip '24/7' etc.)
  if (!/^\d+(\.\d+)?$/.test(target)) {
    el.textContent = target;
    return;
  }
  const num = parseFloat(target);
  const isInt = Number.isInteger(num);
  const start = performance.now();

  function step(now: number) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const v = num * eased;
    el.textContent = isInt ? Math.round(v).toString() : v.toFixed(1);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

export default function Intro({ dict }: Props) {
  const { intro } = dict;
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            counterRefs.current.forEach((el, i) => {
              if (el) animateCounter(el, intro.stats[i].v);
            });
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, [intro]);

  return (
    <section id="intro" className="intro theme-light" ref={sectionRef} data-screen-label="02 Intro">
      <div className="container">
        <div className="intro-grid">
          <div>
            <div className="eyebrow intro-eyebrow reveal">{intro.eyebrow}</div>
            <SplitHeading as="h2" className="display reveal" data-delay="1">
              {intro.headline}
            </SplitHeading>
          </div>
          <div>
            <p
              className="intro-headline reveal"
              data-delay="2"
              dangerouslySetInnerHTML={{ __html: intro.headline2 }}
            />
          </div>
        </div>
        <div className="intro-stats reveal" data-delay="3">
          {intro.stats.map((s, i) => (
            <div className="intro-stat" key={i}>
              <div className="intro-stat-value">
                <span ref={(el) => { counterRefs.current[i] = el; }}>0</span>
                {s.u && <span style={{ color: 'var(--accent-deep)' }}>{s.u}</span>}
              </div>
              <div className="intro-stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

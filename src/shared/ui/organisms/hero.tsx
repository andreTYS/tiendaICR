'use client';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import SplitHeading from '@/shared/ui/atoms/split-heading';
import HeroMountains from '@/shared/ui/organisms/hero-mountains';
import HeroPanel from '@/shared/ui/organisms/hero-panel';
import Icon from '@/shared/ui/organisms/icon';
import type { Dictionary } from '@/shared/lib/i18n/get-dictionary';
import type { Locale } from '@/shared/lib/i18n/types';
import type { HeroDisplayMode } from '@/modules/settings/domain/hero-display-mode';

interface Props {
  dict: Dictionary;
  locale: Locale;
  /** Phase 3: banner carousel injected by the home RSC. */
  bannersSlot?: ReactNode;
  /** Controls which visual layer(s) are shown in the hero canvas. */
  displayMode?: HeroDisplayMode;
  /** Multiplier for all parallax / animation velocities (CSS --anim-scale). */
  animIntensity?: number;
}

export default function Hero({
  dict,
  locale,
  bannersSlot,
  displayMode = 'animation-only',
  animIntensity = 1.6,
}: Props) {
  const { hero } = dict;
  const panelRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const mtRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const intensity =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--anim-scale'),
        ) || 1;

      if (panelRef.current) {
        panelRef.current.style.transform = `perspective(1400px) rotateX(${
          58 - y * 0.03 * intensity
        }deg) rotateY(-8deg) rotateZ(6deg) translateY(${y * 0.15 * intensity}px)`;
      }
      if (sunRef.current) {
        sunRef.current.style.transform = `translate(-50%, calc(-50% + ${y * 0.3 * intensity}px))`;
      }
      if (mtRef.current) {
        mtRef.current.style.transform = `translateY(${y * 0.1 * intensity}px)`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const ctaHref = locale === 'en' ? '/en/contacto' : '/contacto';
  const proyectosHref = locale === 'en' ? '/en/proyectos' : '/proyectos';

  const showSvg = displayMode !== 'banners-only';
  const showBanners = displayMode !== 'animation-only' && !!bannersSlot;
  const showScrim = displayMode === 'banners-over-animation';

  return (
    <section
      className="hero theme-dark noise"
      data-screen-label="01 Hero"
      style={{ '--anim-scale': animIntensity } as React.CSSProperties}
    >
      <div className="hero-canvas">
        <div className="hero-sun" ref={sunRef} />

        {/* SVG animation layer — hidden in banners-only mode */}
        {showSvg && (
          <>
            <div className="hero-mountains" ref={mtRef}>
              <HeroMountains />
            </div>
            <div className="hero-panel" ref={panelRef}>
              <HeroPanel />
            </div>
            <div className="hero-gradient-overlay" />
          </>
        )}

        {/* Banners layer — hidden in animation-only mode */}
        {showBanners && (
          <div
            className={`hero-banners-slot${showScrim ? ' hero-scrim' : ''}`}
            style={{ position: 'absolute', inset: 0, zIndex: showScrim ? 2 : 1 }}
          >
            {bannersSlot}
          </div>
        )}
      </div>

      <div className="hero-content">
        <div className="pill reveal" data-delay="0">
          <span className="dot" />
          {hero.eyebrow}
        </div>

        <h1 className="hero-title" style={{ marginTop: 28 }}>
          <SplitHeading as="span">{hero.line1}</SplitHeading>
          <SplitHeading as="span" className="line-2">
            {hero.line2}
          </SplitHeading>
        </h1>

        <p className="lead reveal" data-delay="3" style={{ maxWidth: 620, marginTop: 20 }}>
          {hero.lead}
        </p>

        <div
          className="reveal"
          data-delay="4"
          style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}
        >
          <Link href={ctaHref} className="btn btn-primary">
            {hero.primary}
            <Icon name="arrow" size={14} />
          </Link>
          <Link href={proyectosHref} className="btn btn-ghost">
            {hero.secondary}
          </Link>
        </div>

        <div className="hero-meta reveal" data-delay="5">
          {hero.meta.map((m, i) => (
            <div className="hero-meta-item" key={i}>
              <div className="hero-meta-label">{m.label}</div>
              <div className="hero-meta-value">
                {i === 2 ? <span className="accent">{m.value}</span> : m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-scroll-hint">{hero.scroll}</div>
    </section>
  );
}

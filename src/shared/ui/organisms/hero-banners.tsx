'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

export interface HeroBannerItem {
  id: string;
  titleEs: string;
  titleEn?: string;
  descEs: string;
  descEn?: string;
  imageUrl: string;
}

interface Props {
  banners: HeroBannerItem[];
  locale: 'es' | 'en';
}

export default function HeroBanners({ banners, locale }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = banners.length;

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % count);
  }, [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    intervalRef.current = setInterval(advance, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [advance, paused, count]);

  function goTo(index: number) {
    setCurrent(index);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') goTo((current - 1 + count) % count);
    if (e.key === 'ArrowRight') goTo((current + 1) % count);
  }

  if (count === 0) return null;

  const banner = banners[current]!;
  const title = locale === 'en' && banner.titleEn ? banner.titleEn : banner.titleEs;
  const desc = locale === 'en' && banner.descEn ? banner.descEn : banner.descEs;

  return (
    <div
      role="region"
      aria-label="Hero banners"
      className="hero-banners"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={handleKey}
      style={{ position: 'relative', width: '100%', height: '100%', outline: 'none' }}
    >
      {/* Slide image */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Image
          src={banner.imageUrl}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          priority={current === 0}
          sizes="100vw"
        />
      </div>

      {/* Content overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '2rem',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
          color: '#fff',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 'clamp(1.25rem, 3vw, 2rem)', fontWeight: 700 }}>
          {title}
        </h2>
        <p style={{ margin: '0.5rem 0 0', opacity: 0.85, maxWidth: 600 }}>{desc}</p>
      </div>

      {/* Controls (only when multiple banners) */}
      {count > 1 && (
        <>
          <button
            aria-label="Banner anterior"
            onClick={() => goTo((current - 1 + count) % count)}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ‹
          </button>

          <button
            aria-label="Banner siguiente"
            onClick={() => goTo((current + 1) % count)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ›
          </button>

          <div
            role="tablist"
            aria-label="Seleccionar banner"
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 6,
            }}
          >
            {banners.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Banner ${i + 1}`}
                onClick={() => goTo(i)}
                style={{
                  width: i === current ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: 'none',
                  background: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'width 0.2s, background 0.2s',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

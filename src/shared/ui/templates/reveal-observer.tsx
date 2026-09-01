'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Renders nothing — sets up IntersectionObserver that adds .in to
 * .reveal and .split-line elements as they enter the viewport.
 * Mirrors the usePageApp reveal logic from shell.jsx.
 *
 * Lives in the public layout, so it persists across client-side route
 * changes. The useEffect depends on `pathname`: when the user navigates
 * from / to /proyectos (for example), the new page's content arrives
 * with `.reveal` elements that still have `.in` missing — CSS keeps them
 * invisible. Re-running the observer on every route change finds those
 * new elements and reveals them.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const apply = () => {
      const vh = window.innerHeight;

      // Force-reveal elements already visible on load
      document.querySelectorAll<HTMLElement>('.reveal:not(.in), .split-line:not(.in)').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) el.classList.add('in');
      });

      // Observe remaining elements
      const remaining = document.querySelectorAll<HTMLElement>('.reveal:not(.in), .split-line:not(.in)');
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).classList.add('in');
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0, rootMargin: '0px 0px -5% 0px' }
      );
      remaining.forEach((el) => io.observe(el));
      return io;
    };

    // Defer the initial pass one animation frame so React has a chance
    // to finish hydrating nested client components (ProjectFilter, etc.)
    // before we mutate className on .reveal elements. Without this the
    // observer races React's hydration commit and triggers a mismatch,
    // which in React 19 causes the whole subtree to re-render — the
    // visible symptom is "page goes blank until I refresh".
    let io: IntersectionObserver | null = null;
    const raf = requestAnimationFrame(() => {
      io = apply();
    });
    const t1 = setTimeout(apply, 200);
    const t2 = setTimeout(apply, 600);

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}

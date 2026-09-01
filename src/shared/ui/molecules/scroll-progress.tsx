'use client';
import { useScrollProgress } from '@/shared/ui/hooks/use-scroll-progress';

/**
 * Fixed thin bar at top of viewport indicating page scroll percentage.
 * "use client" — reads window.scrollY via useScrollProgress hook.
 */
export default function ScrollProgress() {
  const pct = useScrollProgress();
  return (
    <div
      className="scroll-progress"
      style={{ width: `${pct}%` }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Scroll progress"
    />
  );
}

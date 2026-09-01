'use client';

import { useSortable } from '@dnd-kit/sortable';
import Link from 'next/link';
import type { Banner } from '../../domain/banner';

interface Props {
  banner: Banner;
  onToggle: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  toggleError?: string;
  /** When true, skip the dnd-kit hooks and render a static row (used during
   *  SSR / pre-hydration to avoid dnd-kit's incremental aria-describedby IDs
   *  causing a React 19 hydration mismatch). */
  isStatic?: boolean;
}

export default function BannerRow({ banner, onToggle, onDelete, toggleError, isStatic }: Props) {
  if (isStatic) return <StaticRow banner={banner} onToggle={onToggle} onDelete={onDelete} toggleError={toggleError} />;
  return <SortableRow banner={banner} onToggle={onToggle} onDelete={onDelete} toggleError={toggleError} />;
}

function SortableRow({ banner, onToggle, onDelete, toggleError }: Omit<Props, 'isStatic'>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: banner.id });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="banner-list-row">
      <span
        {...attributes}
        {...listeners}
        className="banner-list-handle"
        aria-label="Arrastrar para reordenar"
      >
        ⠿
      </span>
      <Body banner={banner} onToggle={onToggle} onDelete={onDelete} toggleError={toggleError} />
    </div>
  );
}

function StaticRow({ banner, onToggle, onDelete, toggleError }: Omit<Props, 'isStatic'>) {
  return (
    <div className="banner-list-row">
      <span className="banner-list-handle" aria-hidden="true">⠿</span>
      <Body banner={banner} onToggle={onToggle} onDelete={onDelete} toggleError={toggleError} />
    </div>
  );
}

function Body({ banner, onToggle, onDelete, toggleError }: Omit<Props, 'isStatic'>) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/media/${banner.imageKey}`}
        alt={banner.titleEs}
        width={80}
        height={48}
        className="banner-list-thumb"
      />

      <div className="banner-list-info">
        <div className="banner-list-title">{banner.titleEs}</div>
        {banner.titleEn && <div className="banner-list-sub">{banner.titleEn}</div>}
        {toggleError && <div className="admin-field-error">{toggleError}</div>}
      </div>

      <label className="banner-list-toggle">
        <input
          type="checkbox"
          checked={banner.isActive}
          onChange={(e) => onToggle(banner.id, e.target.checked)}
        />
        <span>{banner.isActive ? 'Activo' : 'Inactivo'}</span>
      </label>

      <div className="banner-list-actions">
        <Link
          href={`/admin/banners/${banner.id}/edit`}
          prefetch={false}
          className="admin-btn admin-btn-ghost"
        >
          Editar
        </Link>
        <button
          type="button"
          className="admin-btn admin-btn-danger"
          onClick={() => {
            if (confirm(`¿Eliminar el banner "${banner.titleEs}"?`)) {
              onDelete(banner.id);
            }
          }}
        >
          Eliminar
        </button>
      </div>
    </>
  );
}

'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove, useSortable,
} from '@dnd-kit/sortable';
import Link from 'next/link';
import type { Project } from '../../domain/project';
import type { Category } from '@/modules/categories/domain/category';
import {
  reorderProjectsAction,
  toggleProjectActiveAction,
  deleteProjectAction,
} from '@/app/actions/projects';

interface RowProps {
  project: Project;
  category?: Category;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  toggleError?: string;
  /** When true, skip dnd-kit hooks and render a static row (used during
   *  SSR / pre-hydration to avoid dnd-kit's incremental aria-describedby IDs
   *  causing a React 19 hydration mismatch). */
  isStatic?: boolean;
}

const ROW_STYLE_BASE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 14px',
  background: 'var(--ad-surface)',
  color: 'var(--ad-text)',
  border: '1px solid var(--ad-border)',
  borderRadius: 8,
  marginBottom: 6,
};

function ProjectRow(props: RowProps) {
  if (props.isStatic) return <StaticRow {...props} />;
  return <SortableRow {...props} />;
}

function SortableRow({ project, category, onToggle, onDelete, toggleError }: Omit<RowProps, 'isStatic'>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const style: React.CSSProperties = {
    ...ROW_STYLE_BASE,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <span {...attributes} {...listeners} style={{ cursor: 'grab', fontSize: 18, color: 'var(--ad-text-dim)', userSelect: 'none' }} aria-label="Arrastrar">⠿</span>
      <Body project={project} category={category} onToggle={onToggle} onDelete={onDelete} toggleError={toggleError} />
    </div>
  );
}

function StaticRow({ project, category, onToggle, onDelete, toggleError }: Omit<RowProps, 'isStatic'>) {
  return (
    <div style={ROW_STYLE_BASE}>
      <span style={{ fontSize: 18, color: 'var(--ad-text-dim)', userSelect: 'none' }} aria-hidden="true">⠿</span>
      <Body project={project} category={category} onToggle={onToggle} onDelete={onDelete} toggleError={toggleError} />
    </div>
  );
}

function Body({ project, category, onToggle, onDelete, toggleError }: Omit<RowProps, 'isStatic'>) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/media/${project.mainImageKey}`} alt={project.titleEs} width={64} height={40} style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.titleEs}</div>
        <div style={{ fontSize: 12, color: 'var(--ad-text-dim)' }}>{category?.nameEs ?? project.categoryId} · {project.slug}</div>
        {toggleError && <div className="admin-field-error" style={{ marginTop: 2 }}>{toggleError}</div>}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}>
        <input type="checkbox" checked={project.isActive} onChange={(e) => onToggle(project.id, e.target.checked)} />
        <span style={{ fontSize: 13 }}>{project.isActive ? 'Activo' : 'Inactivo'}</span>
      </label>
      <Link href={`/admin/proyectos/${project.id}/edit`} className="admin-btn admin-btn-ghost" style={{ fontSize: 13, padding: '4px 10px', flexShrink: 0 }}>Editar</Link>
      <button
        className="admin-btn admin-btn-danger"
        style={{ fontSize: 13, padding: '4px 10px', flexShrink: 0, border: 'none' }}
        onClick={() => { if (confirm(`¿Eliminar "${project.titleEs}"?`)) onDelete(project.id); }}
      >Eliminar</button>
    </>
  );
}

interface Props {
  projects: Project[];
  categories: Category[];
}

/**
 * Project list with drag-and-drop reorder.
 *
 * Uses the same pre-hydration pattern as BannerTable: render a plain
 * (non-interactive) list during SSR and the FIRST client paint, then after
 * useEffect fires swap to the full DndContext. This avoids dnd-kit's
 * incremental `aria-describedby` IDs (DndDescribedBy-0, -1, ...) producing a
 * hydration mismatch when server/client disagree on the starting counter.
 */
export default function ProjectTable({ projects: initial, categories }: Props) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);
    setProjects(reordered);
    startTransition(async () => {
      await reorderProjectsAction({ orderedIds: reordered.map((p) => p.id) });
    });
  }

  async function handleToggle(id: string, isActive: boolean) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, isActive } : p)));
    setToggleErrors((prev) => ({ ...prev, [id]: '' }));
    const result = await toggleProjectActiveAction({ id, isActive });
    if (result?.error) {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !isActive } : p)));
      setToggleErrors((prev) => ({ ...prev, [id]: result.error ?? '' }));
    }
  }

  async function handleDelete(id: string) {
    await deleteProjectAction(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  // Pre-hydration: static list, no dnd-kit context anywhere in the tree.
  if (!mounted) {
    return (
      <div>
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            category={catMap[project.categoryId]}
            onToggle={handleToggle}
            onDelete={handleDelete}
            toggleError={toggleErrors[project.id]}
            isStatic
          />
        ))}
      </div>
    );
  }

  // Post-hydration: full DndContext with sortable rows.
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div>
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              category={catMap[project.categoryId]}
              onToggle={handleToggle}
              onDelete={handleDelete}
              toggleError={toggleErrors[project.id]}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
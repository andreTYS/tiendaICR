'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import BannerRow from './banner-row';
import type { Banner } from '../../domain/banner';
import {
  reorderBannersAction,
  toggleActiveAction,
  deleteBannerAction,
} from '@/app/actions/banners';

interface Props {
  banners: Banner[];
}

/**
 * Banner list with drag-and-drop reorder.
 *
 * dnd-kit generates incremental `aria-describedby` IDs (DndDescribedBy-0, -1,
 * ...) from a module-scoped counter. Under SSR + React 19, server and client
 * often disagree on the starting counter → hydration mismatch → React 19
 * discards the entire subtree and re-renders, which the user perceives as a
 * flash of broken UI.
 *
 * Solution: render a plain (non-interactive) list during SSR and the FIRST
 * client paint, then after useEffect fires we swap to the full DndContext.
 * The static/interactive rows share the same markup classes, so the visual
 * change is imperceptible.
 */
export default function BannerTable({ banners: initial }: Props) {
  const [banners, setBanners] = useState<Banner[]>(initial);
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = banners.findIndex((b) => b.id === active.id);
    const newIndex = banners.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(banners, oldIndex, newIndex);
    setBanners(reordered);

    startTransition(async () => {
      await reorderBannersAction({ orderedIds: reordered.map((b) => b.id) });
    });
  }

  async function handleToggle(id: string, isActive: boolean) {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive } : b)));
    setToggleErrors((prev) => ({ ...prev, [id]: '' }));

    const result = await toggleActiveAction({ id, isActive });
    if (result?.error) {
      setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !isActive } : b)));
      setToggleErrors((prev) => ({ ...prev, [id]: result.error ?? '' }));
    }
  }

  async function handleDelete(id: string) {
    await deleteBannerAction(id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  // Pre-hydration: static list, no dnd-kit context anywhere in the tree.
  if (!mounted) {
    return (
      <div className="banner-list">
        {banners.map((banner) => (
          <BannerRow
            key={banner.id}
            banner={banner}
            onToggle={handleToggle}
            onDelete={handleDelete}
            toggleError={toggleErrors[banner.id]}
            isStatic
          />
        ))}
      </div>
    );
  }

  // Post-hydration: full DndContext with sortable rows.
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={banners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="banner-list">
          {banners.map((banner) => (
            <BannerRow
              key={banner.id}
              banner={banner}
              onToggle={handleToggle}
              onDelete={handleDelete}
              toggleError={toggleErrors[banner.id]}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Category } from '../../domain/category';
import { deleteCategoryAction } from '@/app/actions/categories';

interface Props {
  categories: Category[];
}

export default function CategoryList({ categories: initial }: Props) {
  const [categories, setCategories] = useState<Category[]>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleDelete(id: string, nameEs: string) {
    if (!confirm(`¿Eliminar la categoría "${nameEs}"?`)) return;
    const result = await deleteCategoryAction(id);
    if (result?.error) {
      setErrors((prev) => ({ ...prev, [id]: result.error ?? '' }));
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  }

  if (categories.length === 0) {
    return (
      <div className="admin-empty">
        <p>No hay categorías todavía.</p>
        <Link href="/admin/categorias/new" className="admin-btn admin-btn-primary" style={{ marginTop: 12 }}>
          Crear la primera
        </Link>
      </div>
    );
  }

  return (
    <div className="category-list">
      {categories.map((cat) => (
        <div key={cat.id} className="category-list-row">
          <div className="category-list-info">
            <div className="category-list-name">{cat.nameEs}</div>
            {cat.nameEn && <div className="category-list-sub">{cat.nameEn}</div>}
            <div className="category-list-slug">{cat.slug}</div>
            {errors[cat.id] && <div className="admin-field-error">{errors[cat.id]}</div>}
          </div>
          <div className="category-list-actions">
            <Link
              href={`/admin/categorias/${cat.id}/edit`}
              prefetch={false}
              className="admin-btn admin-btn-ghost"
            >
              Editar
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={() => handleDelete(cat.id, cat.nameEs)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
'use client';

import { useActionState } from 'react';
import { toSlug } from '@/shared/lib/slug';
import type { Category } from '../../domain/category';

type ActionState = { error?: string } | null;
type BoundAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;

interface Props {
  action: BoundAction;
  category?: Category;
  submitLabel?: string;
}

export default function CategoryForm({ action, category, submitLabel = 'Guardar' }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction}>
      {state?.error && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 20 }}>
          {state.error}
        </div>
      )}

      <div className="admin-field">
        <label className="admin-field-label">
          Nombre ES <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          name="nameEs"
          defaultValue={category?.nameEs}
          required
          className="admin-field-input"
          onChange={(e) => {
            if (!category) {
              const slugInput = e.currentTarget.form?.elements.namedItem('slug') as HTMLInputElement | null;
              if (slugInput && !slugInput.dataset.dirty) {
                slugInput.value = toSlug(e.target.value);
              }
            }
          }}
        />
      </div>

      <div className="admin-field">
        <label className="admin-field-label">Nombre EN</label>
        <input
          name="nameEn"
          defaultValue={category?.nameEn}
          className="admin-field-input"
        />
      </div>

      <div className="admin-field">
        <label className="admin-field-label">Slug</label>
        <input
          name="slug"
          defaultValue={category?.slug}
          placeholder="auto-generado"
          className="admin-field-input"
          style={{ fontFamily: 'monospace' }}
          onChange={(e) => { e.currentTarget.dataset.dirty = 'true'; }}
        />
        <span className="admin-field-hint">Dejar vacío para auto-generar desde el nombre ES</span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
          {pending ? 'Guardando…' : submitLabel}
        </button>
        <a href="/admin/categorias" className="admin-btn admin-btn-ghost">Cancelar</a>
      </div>
    </form>
  );
}
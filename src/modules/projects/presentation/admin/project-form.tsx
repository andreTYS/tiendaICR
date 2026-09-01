'use client';

import { useActionState, useState } from 'react';
import { toSlug } from '@/shared/lib/slug';
import type { Project } from '../../domain/project';
import type { Category } from '@/modules/categories/domain/category';

type ActionState = { error?: string } | null;
type BoundAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;

interface Props {
  action: BoundAction;
  project?: Project;
  categories: Category[];
  submitLabel?: string;
}

export default function ProjectForm({ action, project, categories, submitLabel = 'Guardar' }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);
  const [preview, setPreview] = useState<string | undefined>(
    project ? `/api/media/${project.mainImageKey}` : undefined,
  );

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  // React 19 infers encType automatically on forms with a function action.
  return (
    <form action={formAction}>
      {state?.error && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 20 }}>
          {state.error}
        </div>
      )}

      {/* Título ES + EN */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="admin-field">
          <label className="admin-field-label">Título ES <span style={{ color: 'red' }}>*</span></label>
          <input
            name="titleEs"
            defaultValue={project?.titleEs}
            required
            className="admin-field-input"
            onChange={(e) => {
              if (!project) {
                const slugInput = e.currentTarget.form?.elements.namedItem('slug') as HTMLInputElement | null;
                if (slugInput && !slugInput.dataset.dirty) slugInput.value = toSlug(e.target.value);
              }
            }}
          />
        </div>
        <div className="admin-field">
          <label className="admin-field-label">Título EN</label>
          <input name="titleEn" defaultValue={project?.titleEn} className="admin-field-input" />
        </div>
      </div>

      {/* Descripción ES + EN */}
      <div className="admin-field">
        <label className="admin-field-label">Descripción ES <span style={{ color: 'red' }}>*</span></label>
        <textarea name="descEs" defaultValue={project?.descEs} required rows={4} className="admin-field-textarea" />
      </div>
      <div className="admin-field">
        <label className="admin-field-label">Descripción EN</label>
        <textarea name="descEn" defaultValue={project?.descEn} rows={4} className="admin-field-textarea" />
      </div>

      {/* Ubicación + Categoría */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="admin-field">
          <label className="admin-field-label">Ubicación</label>
          <input name="location" defaultValue={project?.location} className="admin-field-input" />
        </div>
        <div className="admin-field">
          <label className="admin-field-label">Categoría <span style={{ color: 'red' }}>*</span></label>
          <select name="categoryId" defaultValue={project?.categoryId} required className="admin-field-select">
            <option value="">Seleccionar…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nameEs}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Slug */}
      <div className="admin-field">
        <label className="admin-field-label">Slug</label>
        <input
          name="slug"
          defaultValue={project?.slug}
          placeholder="auto-generado"
          className="admin-field-input"
          style={{ fontFamily: 'monospace' }}
          onChange={(e) => { e.currentTarget.dataset.dirty = 'true'; }}
        />
        <span className="admin-field-hint">Auto-generado desde Título ES si se deja vacío</span>
      </div>

      {/* Imagen principal */}
      <div className="admin-field">
        <label className="admin-field-label">
          Imagen principal {!project ? <span style={{ color: 'red' }}>*</span> : '(vacío = mantener actual)'}
        </label>
        <input
          name="mainImage"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required={!project}
          onChange={handleFile}
        />
        {preview && (
          <img src={preview} alt="Preview" style={{ marginTop: 10, width: 320, height: 180, objectFit: 'cover', borderRadius: 6 }} />
        )}
      </div>

      {/* Activo */}
      <div className="admin-field">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input name="isActive" type="checkbox" defaultChecked={project?.isActive} />
          <span>Activo (visible en el sitio público)</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
          {pending ? 'Guardando…' : submitLabel}
        </button>
        <a href="/admin/proyectos" className="admin-btn admin-btn-ghost">Cancelar</a>
      </div>
    </form>
  );
}
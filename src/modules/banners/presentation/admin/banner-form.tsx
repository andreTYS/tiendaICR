'use client';

import { useActionState, useState } from 'react';
import type { Banner } from '../../domain/banner';

type ActionState = { error?: string } | null;
type BoundAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;

interface Props {
  action: BoundAction;
  banner?: Banner;
  maxReached?: boolean;
  submitLabel?: string;
}

export default function BannerForm({
  action,
  banner,
  maxReached = false,
  submitLabel = 'Guardar',
}: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);
  const [preview, setPreview] = useState<string | undefined>(
    banner ? `/api/media/${banner.imageKey}` : undefined,
  );

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  const isActive = banner?.isActive ?? false;
  const disableActive = !isActive && maxReached;

  // React 19 infers encType="multipart/form-data" automatically on any
  // <form action={fn}> that contains a file input — explicitly declaring
  // encType here would throw "Cannot specify a encType or method..." error.
  return (
    <form action={formAction}>
      {state?.error && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 20 }}>
          {state.error}
        </div>
      )}

      <div className="admin-field">
        <label className="admin-field-label">
          Título ES <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          name="titleEs"
          defaultValue={banner?.titleEs}
          required
          className="admin-field-input"
        />
      </div>

      <div className="admin-field">
        <label className="admin-field-label">
          Título EN
        </label>
        <input
          name="titleEn"
          defaultValue={banner?.titleEn}
          className="admin-field-input"
        />
      </div>

      <div className="admin-field">
        <label className="admin-field-label">
          Descripción ES <span style={{ color: 'red' }}>*</span>
        </label>
        <textarea
          name="descEs"
          defaultValue={banner?.descEs}
          required
          rows={3}
          className="admin-field-textarea"
        />
      </div>

      <div className="admin-field">
        <label className="admin-field-label">
          Descripción EN
        </label>
        <textarea
          name="descEn"
          defaultValue={banner?.descEn}
          rows={3}
          className="admin-field-textarea"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="admin-field">
          <label className="admin-field-label">
            CTA Label ES
          </label>
          <input
            name="ctaLabelEs"
            defaultValue={banner?.ctaLabelEs}
            className="admin-field-input"
          />
        </div>
        <div className="admin-field">
          <label className="admin-field-label">
            CTA Label EN
          </label>
          <input
            name="ctaLabelEn"
            defaultValue={banner?.ctaLabelEn}
            className="admin-field-input"
          />
        </div>
      </div>

      <div className="admin-field">
        <label className="admin-field-label">
          CTA URL
        </label>
        <input
          name="ctaHref"
          type="url"
          defaultValue={banner?.ctaHref}
          placeholder="https://..."
          className="admin-field-input"
        />
      </div>

      <div className="admin-field">
        <label className="admin-field-label">
          Imagen {!banner ? <span style={{ color: 'red' }}>*</span> : '(dejar vacío para mantener la actual)'}
        </label>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required={!banner}
          onChange={handleFile}
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{ marginTop: 10, width: 320, height: 180, objectFit: 'cover', borderRadius: 6 }}
          />
        )}
      </div>

      <div className="admin-field">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: disableActive ? 'not-allowed' : 'pointer' }}>
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={banner?.isActive}
            disabled={disableActive}
          />
          <span>Activo</span>
          {disableActive && (
            <span className="admin-field-hint" style={{ marginTop: 0 }}>
              (Límite de banners activos alcanzado)
            </span>
          )}
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          type="submit"
          disabled={pending}
          className="admin-btn admin-btn-primary"
        >
          {pending ? 'Guardando…' : submitLabel}
        </button>
        <a href="/admin/banners" className="admin-btn admin-btn-ghost">
          Cancelar
        </a>
      </div>
    </form>
  );
}
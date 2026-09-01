'use client';

import { useActionState } from 'react';
import type { SiteContact } from '../../domain/site-contact';
import { updateSiteContactAction } from '@/app/actions/site-contact';

interface Props {
  contact: SiteContact;
}

type ActionState = { error?: string; ok?: true } | null;

interface FieldDef {
  name: keyof Omit<SiteContact, 'id' | 'updatedAt'>;
  label: string;
  type?: 'text' | 'url' | 'email' | 'tel';
  placeholder?: string;
  hint?: string;
}

const CONTACT_FIELDS: FieldDef[] = [
  { name: 'phone', label: 'Teléfono principal', type: 'tel', placeholder: '+51 954 112 488' },
  { name: 'whatsapp', label: 'WhatsApp', type: 'tel', placeholder: '+51 987 334 209', hint: 'Solo el número — el enlace wa.me/ se arma solo.' },
  { name: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'proyectos@inversionesicr.com' },
  { name: 'addressLine', label: 'Dirección', placeholder: 'Av. Ejército 789, Cayma' },
  { name: 'addressCity', label: 'Ciudad principal', placeholder: 'Arequipa' },
  { name: 'cities', label: 'Cobertura (texto libre)', placeholder: 'Arequipa · Lima · Cusco', hint: 'Aparece en el pie del footer.' },
];

const SOCIAL_FIELDS: FieldDef[] = [
  { name: 'instagramUrl', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/inversionesicr' },
  { name: 'facebookUrl', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/inversionesicr' },
  { name: 'linkedinUrl', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/company/inversionesicr' },
  { name: 'tiktokUrl', label: 'TikTok', type: 'url', placeholder: 'https://tiktok.com/@inversionesicr' },
  { name: 'youtubeUrl', label: 'YouTube', type: 'url', placeholder: 'https://youtube.com/@inversionesicr' },
  { name: 'twitterUrl', label: 'X (Twitter)', type: 'url', placeholder: 'https://x.com/inversionesicr' },
];

export default function SiteContactForm({ contact }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateSiteContactAction,
    null,
  );

  return (
    <form action={action}>
      {state?.error && (
        <div role="alert" className="admin-field-error" style={{ marginBottom: 20 }}>
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div
          role="status"
          style={{
            marginBottom: 20,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'color-mix(in srgb, var(--ad-success) 14%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ad-success) 40%, transparent)',
            color: 'var(--ad-success)',
            fontSize: 13,
          }}
        >
          ✓ Cambios guardados. Se aplican en el sitio público al instante.
        </div>
      )}

      <FieldGroup title="Contacto" fields={CONTACT_FIELDS} contact={contact} />
      <FieldGroup
        title="Redes sociales"
        description="Deja en blanco las redes que no uses — se ocultan automáticamente del sitio."
        fields={SOCIAL_FIELDS}
        contact={contact}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={pending}
        >
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

function FieldGroup({
  title,
  description,
  fields,
  contact,
}: {
  title: string;
  description?: string;
  fields: FieldDef[];
  contact: SiteContact;
}) {
  return (
    <fieldset
      style={{
        border: '1px solid var(--ad-border-soft)',
        borderRadius: 10,
        padding: '18px 20px 6px',
        marginBottom: 20,
      }}
    >
      <legend
        style={{
          padding: '0 8px',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ad-text-dim)',
        }}
      >
        {title}
      </legend>
      {description && (
        <p style={{ fontSize: 13, color: 'var(--ad-text-dim)', marginBottom: 16 }}>
          {description}
        </p>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
        }}
      >
        {fields.map((f) => (
          <div className="admin-field" key={f.name}>
            <label className="admin-field-label" htmlFor={`sc-${f.name}`}>
              {f.label}
            </label>
            <input
              id={`sc-${f.name}`}
              name={f.name}
              type={f.type ?? 'text'}
              defaultValue={contact[f.name] as string}
              placeholder={f.placeholder}
              className="admin-field-input"
              autoComplete="off"
            />
            {f.hint && (
              <div style={{ fontSize: 11, color: 'var(--ad-text-faint)', marginTop: 4 }}>
                {f.hint}
              </div>
            )}
          </div>
        ))}
      </div>
    </fieldset>
  );
}

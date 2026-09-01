'use client';
import { useState } from 'react';
import Icon, { type IconName } from '@/shared/ui/organisms/icon';
import type { Dictionary } from '@/shared/lib/i18n/get-dictionary';
import { submitContact } from '@/app/actions/contact';
import type { SiteContact } from '@/modules/site-contact/domain/site-contact';
import SocialLinks from '@/shared/ui/molecules/social-links';

interface Props {
  dict: Pick<Dictionary, 'contacto'>;
  contact?: SiteContact | null;
}

const ICON_NAMES: readonly IconName[] = ['pin', 'phone', 'whatsapp', 'mail'] as const;

interface InfoRow {
  icon: IconName;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

export default function Contacto({ dict, contact }: Props) {
  const { contacto } = dict;
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const rows = buildInfoRows(contacto.info, contact);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setServerError(null);
    const formData = new FormData(e.currentTarget);
    const result = await submitContact(formData);
    setPending(false);
    if (result.success) {
      setSent(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSent(false), 5000);
    } else {
      setServerError(result.error ?? 'Error al enviar. Intenta de nuevo.');
    }
  }

  return (
    <section id="contacto" className="contacto theme-dark" data-screen-label="08 Contacto">
      <div className="container">
        <div className="contacto-grid">
          {/* Info column */}
          <div className="contacto-text">
            <div className="eyebrow reveal">{contacto.eyebrow}</div>
            <h2 className="reveal" data-delay="1" style={{ marginTop: 24 }}>
              <span className="split-line">
                <span>{contacto.title1}</span>
              </span>
              <span className="split-line">
                <span style={{ transitionDelay: '0.1s' }}>{contacto.title2}</span>
              </span>
              <span className="split-line">
                <span
                  style={{
                    transitionDelay: '0.2s',
                    fontStyle: 'italic',
                    color: 'var(--accent)',
                    fontWeight: 400,
                  }}
                >
                  {contacto.title3}
                </span>
              </span>
            </h2>
            <p className="lead reveal" data-delay="3" style={{ marginTop: 24 }}>
              {contacto.lead}
            </p>
            <div className="contacto-info reveal" data-delay="4">
              {rows.map((row, i) => (
                <div className="contacto-info-row" key={i}>
                  <div className="contacto-info-icon">
                    <Icon name={row.icon} size={16} />
                  </div>
                  <div>
                    <div className="contacto-info-label">{row.label}</div>
                    <div className="contacto-info-value">
                      {row.href ? (
                        <a
                          href={row.href}
                          target={row.external ? '_blank' : undefined}
                          rel={row.external ? 'noopener noreferrer' : undefined}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {contact && (
              <div className="reveal" data-delay="5" style={{ marginTop: 32 }}>
                <SocialLinks contact={contact} />
              </div>
            )}
          </div>

          {/* Form column */}
          <form className="contacto-form reveal" data-delay="2" onSubmit={handleSubmit}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                marginBottom: 6,
              }}
            >
              {contacto.form.title}
            </h3>
            <p style={{ color: 'var(--d-text-dim)', fontSize: 13, marginBottom: 28 }}>
              {contacto.form.sub}
            </p>

            <div className="form-field">
              <label className="form-label">{contacto.form.name}</label>
              <input className="form-input" name="name" required />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">{contacto.form.email}</label>
                <input type="email" className="form-input" name="email" required />
              </div>
              <div className="form-field">
                <label className="form-label">{contacto.form.phone}</label>
                <input className="form-input" name="phone" required />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">{contacto.form.bill}</label>
              <input className="form-input" name="bill" placeholder="Ej. 450" />
            </div>

            <div className="form-field">
              <label className="form-label">{contacto.form.message}</label>
              <textarea className="form-textarea" name="message" />
            </div>

            {serverError && (
              <p style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12 }}>
                ⚠ {serverError}
              </p>
            )}
            {sent && (
              <p style={{ color: '#4caf50', fontSize: 13, marginBottom: 12 }}>
                ✓ {contacto.form.sent}
              </p>
            )}
            <button type="submit" className="form-submit" disabled={pending || sent}>
              {pending ? '…' : sent ? contacto.form.sent : contacto.form.submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/**
 * Merge dict labels with DB values. When `contact` is null or every relevant
 * DB field is blank, fall back to the static dict entries unchanged.
 */
function buildInfoRows(
  dictInfo: readonly { l: string; v: string }[],
  contact: SiteContact | null | undefined,
): InfoRow[] {
  if (!contact) {
    return dictInfo.map((row, i) => ({
      icon: ICON_NAMES[i % ICON_NAMES.length],
      label: row.l,
      value: row.v,
    }));
  }

  const addressValue = [contact.addressLine, contact.addressCity]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' · ');

  const dbValues: Array<{ value: string; href?: string; external?: boolean }> = [
    { value: addressValue },
    {
      value: contact.phone,
      href: contact.phone ? `tel:${contact.phone.replace(/\s+/g, '')}` : undefined,
    },
    {
      value: contact.whatsapp,
      href: contact.whatsapp
        ? `https://wa.me/${contact.whatsapp.replace(/[^\d]/g, '')}`
        : undefined,
      external: true,
    },
    {
      value: contact.email,
      href: contact.email ? `mailto:${contact.email}` : undefined,
    },
  ];

  const rows: InfoRow[] = [];
  for (let i = 0; i < dictInfo.length; i++) {
    const fromDb = dbValues[i];
    const value = fromDb?.value?.trim() || dictInfo[i].v;
    if (!value) continue;
    rows.push({
      icon: ICON_NAMES[i % ICON_NAMES.length],
      label: dictInfo[i].l,
      value,
      href: fromDb?.value?.trim() ? fromDb.href : undefined,
      external: fromDb?.external,
    });
  }
  return rows;
}

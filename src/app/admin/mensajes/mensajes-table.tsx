'use client';

import { useState } from 'react';
import type { ContactMessage } from '@/modules/contact/domain/contact-message';
import {
  markContactAsReadAction,
  deleteContactAction,
} from '@/app/actions/contact';

interface Props {
  messages: ContactMessage[];
}

export default function MensajesTable({ messages }: Props) {
  const [optimistic, setOptimistic] = useState<
    Record<string, 'read' | 'deleted'>
  >({});

  async function handleMarkRead(id: string) {
    setOptimistic((prev) => ({ ...prev, [id]: 'read' }));
    await markContactAsReadAction(id);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este mensaje?')) return;
    setOptimistic((prev) => ({ ...prev, [id]: 'deleted' }));
    await deleteContactAction(id);
  }

  const visible = messages.filter((m) => optimistic[m.id] !== 'deleted');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {visible.map((msg) => {
        const isRead = optimistic[msg.id] === 'read' || !!msg.readAt;
        return (
          <div
            key={msg.id}
            className="admin-card"
            style={{
              border: `1px solid ${isRead ? 'var(--ad-border-soft)' : 'var(--ad-accent)'}`,
              background: isRead ? 'var(--ad-surface)' : 'var(--ad-accent-soft)',
              color: 'var(--ad-text)',
              borderLeft: isRead ? undefined : '3px solid var(--ad-accent)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>{msg.name}</span>
                <span style={{ color: 'var(--ad-text-dim)', fontSize: 13, marginLeft: 8 }}>
                  {msg.email}
                </span>
                {msg.phone && (
                  <span style={{ color: 'var(--ad-text-dim)', fontSize: 13, marginLeft: 8 }}>
                    · {msg.phone}
                  </span>
                )}
              </div>
              <span style={{ color: 'var(--ad-text-faint)', fontSize: 12, whiteSpace: 'nowrap' }}>
                {new Date(msg.createdAt).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {msg.subject && (
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                {msg.subject}
              </p>
            )}
            <p style={{ fontSize: 14, color: 'var(--ad-text)', lineHeight: 1.6, marginBottom: 12 }}>
              {msg.body}
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              {!isRead && (
                <button
                  onClick={() => handleMarkRead(msg.id)}
                  className="admin-btn admin-btn-secondary"
                  style={{ fontSize: 12, padding: '4px 12px' }}
                >
                  Marcar leído
                </button>
              )}
              <button
                onClick={() => handleDelete(msg.id)}
                className="admin-btn admin-btn-danger"
                style={{ fontSize: 12, padding: '4px 12px' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
import type { Metadata } from 'next';
import { listContactMessages } from '@/modules/contact/application/list-contact-messages';
import { prismaContactRepository } from '@/modules/contact/infrastructure/prisma-contact-repository';
import MensajesTable from './mensajes-table';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

export const metadata: Metadata = {
  title: 'Mensajes | Inversiones ICR Admin',
  robots: { index: false, follow: false },
};

export default async function AdminMensajesPage() {
  const result = await listContactMessages({ repo: prismaContactRepository });
  const messages = result.ok ? result.value : [];

  return (
    <AdminPageShell
      title="Mensajes de contacto"
      description={`${messages.length} mensaje${messages.length !== 1 ? 's' : ''} recibido${messages.length !== 1 ? 's' : ''}`}
      breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Mensajes' }]}
    >
      {messages.length === 0 ? (
        <div className="admin-empty">
          <p>No hay mensajes todavía.</p>
        </div>
      ) : (
        <MensajesTable messages={messages} />
      )}
    </AdminPageShell>
  );
}
import { getSiteContact } from '@/modules/site-contact/application/get-site-contact';
import { prismaSiteContactRepository } from '@/modules/site-contact/infrastructure/prisma-site-contact-repository';
import SiteContactForm from '@/modules/site-contact/presentation/admin/site-contact-form';
import AdminPageShell from '@/app/admin/_components/admin-page-shell';

export const metadata = { title: 'Contacto y redes | Inversiones ICR Admin' };

export default async function AdminContactoPage() {
  const result = await getSiteContact({ repo: prismaSiteContactRepository });
  const contact = result.ok ? result.value : null;

  if (!contact) {
    return (
      <AdminPageShell
        title="Contacto y redes"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Contacto y redes' }]}
      >
        <div className="admin-empty">
          <p>No se pudo cargar la información de contacto.</p>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Contacto y redes"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Contacto y redes' }]}
    >
      <p style={{ color: 'var(--ad-text-dim)', fontSize: 14, marginBottom: 20, maxWidth: 640 }}>
        Estos valores se muestran en el footer del sitio público y en la página de contacto.
        Al guardar, los cambios se reflejan al instante en todo el sitio.
      </p>
      <div className="admin-card">
        <SiteContactForm contact={contact} />
      </div>
    </AdminPageShell>
  );
}

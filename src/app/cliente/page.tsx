/**
 * Client portal index — lists the projects the signed-in user has access to.
 *
 * Routing rules (enforced by proxy.ts):
 *  - Unauthenticated → /cliente/login
 *  - ADMIN/EDITOR    → listed projects they own access to (usually none, but
 *                      we still show their email and a "back to admin" link).
 *  - CLIENT          → only projects with an explicit ClientAccess row.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/shared/lib/auth';
import { prismaClientAccessRepository } from '@/modules/client-access/infrastructure/prisma-client-access-repository';

export const dynamic = 'force-dynamic';

export default async function ClientPortalIndex() {
  const session = await auth();
  if (!session?.user) redirect('/cliente/login');

  const userId = (session.user as { id: string }).id;
  const accesses = await prismaClientAccessRepository.listByUser(userId);

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Mis instalaciones</h1>
          <div style={{ color: 'var(--ad-text-dim)', fontSize: 13 }}>{session.user.email}</div>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/cliente/login' });
          }}
        >
          <button type="submit" className="admin-btn admin-btn-ghost">
            Cerrar sesión
          </button>
        </form>
      </header>

      {accesses.length === 0 ? (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            border: '1px dashed var(--ad-border)',
            color: 'var(--ad-text-dim)',
            textAlign: 'center',
          }}
        >
          Aún no tienes proyectos vinculados a tu cuenta. Si crees que esto
          es un error, contacta a Inversiones ICR.
        </div>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          {accesses.map((a) => (
            <li key={a.id}>
              <Link
                href={`/cliente/${a.project.slug}`}
                prefetch={false}
                style={{
                  display: 'block',
                  background: 'var(--ad-surface)',
                  border: '1px solid var(--ad-border)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/media/${a.project.mainImageKey}`}
                  alt={a.project.titleEs}
                  style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover' }}
                />
                <div style={{ padding: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.project.titleEs}</div>
                  <div style={{ fontSize: 12, color: 'var(--ad-text-dim)' }}>
                    Ver estadísticas →
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

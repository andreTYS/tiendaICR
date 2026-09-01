'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/shared/lib/auth';
import type { Role } from '@/modules/auth/domain/user-role';

import { createClientAccess } from '@/modules/client-access/application/create-client-access';
import { revokeClientAccess } from '@/modules/client-access/application/revoke-client-access';

import { prismaClientAccessRepository } from '@/modules/client-access/infrastructure/prisma-client-access-repository';
import { prismaUserRepository } from '@/modules/auth/infrastructure/prisma-user-repository';
import { bcryptPasswordHasher } from '@/modules/auth/infrastructure/bcrypt-password-hasher';
import { prismaProjectRepository } from '@/modules/projects/infrastructure/prisma-project-repository';

type CreateState =
  | {
      error?: string;
      ok?: true;
      result?: {
        email: string;
        generatedPassword: string | null;
        alreadyHadAccess: boolean;
      };
    }
  | null;

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Sin permisos',
  VALIDATION: 'Email inválido',
  PROJECT_NOT_FOUND: 'Proyecto no encontrado',
};

async function requireRole(): Promise<Role | null> {
  const session = await auth();
  return (session?.user?.role as Role | undefined) ?? null;
}

export async function createClientAccessAction(
  projectId: string,
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  const role = await requireRole();
  if (!role) return { error: 'Sin permisos' };

  const email = String(formData.get('email') ?? '').trim();

  const result = await createClientAccess(
    { data: { projectId, email }, callerRole: role },
    {
      accessRepo: prismaClientAccessRepository,
      userRepo: prismaUserRepository,
      hasher: bcryptPasswordHasher,
      projectRepo: prismaProjectRepository,
    },
  );

  if (!result.ok) {
    return { error: ERROR_MESSAGES[result.error] ?? result.error };
  }

  revalidatePath(`/admin/proyectos/${projectId}/edit`);
  return {
    ok: true,
    result: {
      email: result.value.email,
      generatedPassword: result.value.generatedPassword,
      alreadyHadAccess: result.value.alreadyHadAccess,
    },
  };
}

export async function revokeClientAccessAction(
  accessId: string,
  projectId: string,
): Promise<{ ok: boolean; error?: string }> {
  const role = await requireRole();
  if (!role) return { ok: false, error: 'Sin permisos' };

  const result = await revokeClientAccess(
    { id: accessId, callerRole: role },
    { accessRepo: prismaClientAccessRepository },
  );
  if (!result.ok) return { ok: false, error: 'Sin permisos' };
  revalidatePath(`/admin/proyectos/${projectId}/edit`);
  return { ok: true };
}

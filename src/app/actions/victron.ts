'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/shared/lib/auth';
import type { Role } from '@/modules/auth/domain/user-role';

import { saveVictronToken } from '@/modules/victron/application/save-victron-token';
import { clearVictronToken } from '@/modules/victron/application/clear-victron-token';
import { listVrmInstallations } from '@/modules/victron/application/list-vrm-installations';
import { linkVictronSite } from '@/modules/victron/application/link-victron-site';
import { updateVictronSite } from '@/modules/victron/application/update-victron-site';
import { unlinkVictronSite } from '@/modules/victron/application/unlink-victron-site';

import { prismaVictronConfigRepository } from '@/modules/victron/infrastructure/prisma-victron-config-repository';
import { prismaVictronSiteRepository } from '@/modules/victron/infrastructure/prisma-victron-site-repository';
import { vrmApiClient } from '@/modules/victron/infrastructure/vrm-api-client';
import { prismaProjectRepository } from '@/modules/projects/infrastructure/prisma-project-repository';

type ActionState = { error?: string; ok?: true; message?: string } | null;

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Sin permisos',
  VALIDATION: 'Datos inválidos',
  TOKEN_NOT_CONFIGURED: 'No has guardado el token Victron todavía.',
  TOKEN_INVALID: 'El token fue rechazado por Victron. Revisa que sea correcto y vigente.',
  VRM_API_ERROR: 'No se pudo contactar con la API de Victron. Intenta de nuevo en un momento.',
  SITE_NOT_FOUND: 'Este proyecto aún no tiene una instalación Victron vinculada.',
  ALREADY_LINKED: 'Esa instalación Victron ya está vinculada a otro proyecto.',
  PROJECT_NOT_FOUND: 'Proyecto no encontrado.',
};

async function requireRole(): Promise<Role | null> {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  return role ?? null;
}

// ─── Token (singleton) ────────────────────────────────────────────────────

export async function saveVictronTokenAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = await requireRole();
  if (!role) return { error: 'Sin permisos' };

  const token = String(formData.get('token') ?? '').trim();
  const result = await saveVictronToken(
    { token, callerRole: role },
    { configRepo: prismaVictronConfigRepository, vrm: vrmApiClient },
  );

  if (!result.ok) return { error: ERROR_MESSAGES[result.error] ?? result.error };

  revalidatePath('/admin/settings');
  return {
    ok: true,
    message: `Token guardado. Conectado como ${result.value.victronUserName ?? 'usuario'}${
      result.value.victronEmail ? ` (${result.value.victronEmail})` : ''
    }.`,
  };
}

export async function clearVictronTokenAction(): Promise<ActionState> {
  const role = await requireRole();
  if (!role) return { error: 'Sin permisos' };
  const result = await clearVictronToken(
    { callerRole: role },
    { configRepo: prismaVictronConfigRepository },
  );
  if (!result.ok) return { error: ERROR_MESSAGES[result.error] ?? result.error };
  revalidatePath('/admin/settings');
  return { ok: true, message: 'Token eliminado.' };
}

// ─── Link / unlink / update VictronSite ───────────────────────────────────

export interface InstallationOption {
  idSite: number;
  name: string;
  identifier: string;
}

/**
 * Returns the list of installations the saved token can see, so the admin
 * UI can render a dropdown. Empty array on any failure — the page reports
 * the underlying state separately.
 */
export async function getVrmInstallationsAction(): Promise<{
  ok: boolean;
  installations: InstallationOption[];
  error?: string;
}> {
  const role = await requireRole();
  if (!role) return { ok: false, installations: [], error: 'Sin permisos' };

  const result = await listVrmInstallations(
    { callerRole: role },
    { configRepo: prismaVictronConfigRepository, vrm: vrmApiClient },
  );
  if (!result.ok) {
    return {
      ok: false,
      installations: [],
      error: ERROR_MESSAGES[result.error] ?? result.error,
    };
  }
  return {
    ok: true,
    installations: result.value.map((i) => ({
      idSite: i.idSite,
      name: i.name,
      identifier: i.identifier,
    })),
  };
}

export async function linkVictronSiteAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = await requireRole();
  if (!role) return { error: 'Sin permisos' };

  const idSite = formData.get('idSite');
  const displayName = formData.get('displayName');

  const result = await linkVictronSite(
    {
      data: { projectId, idSite, displayName: displayName ? String(displayName) : undefined },
      callerRole: role,
    },
    { siteRepo: prismaVictronSiteRepository, projectRepo: prismaProjectRepository },
  );

  if (!result.ok) return { error: ERROR_MESSAGES[result.error] ?? result.error };
  revalidatePath(`/admin/proyectos/${projectId}/edit`);
  return { ok: true, message: 'Instalación vinculada.' };
}

export async function updateVictronSiteAction(
  projectId: string,
  patch: {
    displayName?: string;
    isPublicMetrics?: boolean;
    showPv?: boolean;
    showBattery?: boolean;
    showLoad?: boolean;
    showGrid?: boolean;
  },
): Promise<{ ok: boolean; error?: string }> {
  const role = await requireRole();
  if (!role) return { ok: false, error: 'Sin permisos' };

  const result = await updateVictronSite(
    { projectId, data: patch, callerRole: role },
    { siteRepo: prismaVictronSiteRepository },
  );

  if (!result.ok) return { ok: false, error: ERROR_MESSAGES[result.error] ?? result.error };

  revalidatePath(`/admin/proyectos/${projectId}/edit`);
  // Public project page must also rebuild when isPublicMetrics flips.
  const project = await prismaProjectRepository.findById(projectId);
  if (project) {
    revalidatePath(`/proyectos/${project.slug}`);
    revalidatePath(`/en/proyectos/${project.slug}`);
  }
  return { ok: true };
}

export async function unlinkVictronSiteAction(
  projectId: string,
): Promise<{ ok: boolean; error?: string }> {
  const role = await requireRole();
  if (!role) return { ok: false, error: 'Sin permisos' };

  const result = await unlinkVictronSite(
    { projectId, callerRole: role },
    { siteRepo: prismaVictronSiteRepository },
  );
  if (!result.ok) return { ok: false, error: ERROR_MESSAGES[result.error] ?? result.error };
  revalidatePath(`/admin/proyectos/${projectId}/edit`);
  return { ok: true };
}

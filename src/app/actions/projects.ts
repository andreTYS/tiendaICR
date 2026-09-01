'use server';

import { auth } from '@/modules/auth/infrastructure/authjs-config';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createProject } from '@/modules/projects/application/create-project';
import { updateProject } from '@/modules/projects/application/update-project';
import { deleteProject } from '@/modules/projects/application/delete-project';
import { reorderProjects } from '@/modules/projects/application/reorder-projects';
import { addProjectImage } from '@/modules/projects/application/add-project-image';
import { removeProjectImage } from '@/modules/projects/application/remove-project-image';
import { reorderProjectImages } from '@/modules/projects/application/reorder-project-images';
import { prismaProjectRepository } from '@/modules/projects/infrastructure/prisma-project-repository';
import { prismaCategoryRepository } from '@/modules/categories/infrastructure/prisma-category-repository';
import { localDiskStorage } from '@/modules/media/infrastructure/local-disk-storage';
import type { Role } from '@/modules/auth/domain/user-role';

type ActionState = { error?: string } | null;

async function getRole(): Promise<Role | null> {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!role || !['ADMIN', 'EDITOR'].includes(role)) return null;
  return role;
}

function invalidateProjects() {
  revalidateTag('projects', { expire: 0 });
  revalidatePath('/admin/proyectos');
  revalidatePath('/proyectos');
  revalidatePath('/en/proyectos');
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProjectAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const file = formData.get('mainImage') as File | null;
  if (!file || file.size === 0) return { error: 'La imagen principal es obligatoria' };

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await createProject(
    {
      titleEs: String(formData.get('titleEs') ?? ''),
      titleEn: (formData.get('titleEn') as string) || undefined,
      descEs: String(formData.get('descEs') ?? ''),
      descEn: (formData.get('descEn') as string) || undefined,
      location: (formData.get('location') as string) || undefined,
      categoryId: String(formData.get('categoryId') ?? ''),
      slug: (formData.get('slug') as string) || undefined,
      isActive: formData.get('isActive') === 'on',
      imageBuffer: buffer,
      imageMimeType: file.type,
      imageOriginalName: file.name,
      imageSize: file.size,
    },
    { repo: prismaProjectRepository, categoryRepo: prismaCategoryRepository, storage: localDiskStorage },
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      VALIDATION: 'Datos inválidos',
      DUPLICATE_SLUG: 'El slug ya existe',
      CATEGORY_NOT_FOUND: 'Categoría no encontrada',
      INVALID_IMAGE: 'Imagen inválida (formato o tamaño)',
      STORAGE_FAILURE: 'Error al guardar la imagen',
    };
    return { error: messages[result.error] ?? result.error };
  }

  invalidateProjects();
  redirect('/admin/proyectos');
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProjectAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const file = formData.get('mainImage') as File | null;
  const hasNewImage = file && file.size > 0;
  const imageBuffer = hasNewImage ? Buffer.from(await file.arrayBuffer()) : undefined;

  const result = await updateProject(
    {
      id,
      patch: {
        titleEs: (formData.get('titleEs') as string) || undefined,
        titleEn: (formData.get('titleEn') as string) || undefined,
        descEs: (formData.get('descEs') as string) || undefined,
        descEn: (formData.get('descEn') as string) || undefined,
        location: (formData.get('location') as string) || undefined,
        categoryId: (formData.get('categoryId') as string) || undefined,
        slug: (formData.get('slug') as string) || undefined,
        isActive: formData.has('isActive') ? formData.get('isActive') === 'on' : undefined,
        imageBuffer,
        imageMimeType: hasNewImage ? file.type : undefined,
        imageOriginalName: hasNewImage ? file.name : undefined,
        imageSize: hasNewImage ? file.size : undefined,
      },
    },
    { repo: prismaProjectRepository, categoryRepo: prismaCategoryRepository, storage: localDiskStorage },
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      NOT_FOUND: 'Proyecto no encontrado',
      VALIDATION: 'Datos inválidos',
      DUPLICATE_SLUG: 'El slug ya existe',
      CATEGORY_NOT_FOUND: 'Categoría no encontrada',
      INVALID_IMAGE: 'Imagen inválida',
      STORAGE_FAILURE: 'Error al guardar la imagen',
    };
    return { error: messages[result.error] ?? result.error };
  }

  invalidateProjects();
  redirect('/admin/proyectos');
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProjectAction(id: string): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await deleteProject(
    { id },
    { repo: prismaProjectRepository, storage: localDiskStorage },
  );

  if (!result.ok) return { error: 'Proyecto no encontrado' };

  invalidateProjects();
  return null;
}

// ─── Toggle active ────────────────────────────────────────────────────────────

export async function toggleProjectActiveAction(input: {
  id: string;
  isActive: boolean;
}): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await updateProject(
    { id: input.id, patch: { isActive: input.isActive } },
    { repo: prismaProjectRepository, categoryRepo: prismaCategoryRepository, storage: localDiskStorage },
  );

  if (!result.ok) return { error: result.error };

  invalidateProjects();
  return null;
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

export async function reorderProjectsAction(input: { orderedIds: string[] }): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await reorderProjects(input, { repo: prismaProjectRepository });
  if (!result.ok) return { error: 'Error al reordenar' };

  invalidateProjects();
  return null;
}

// ─── Gallery images ───────────────────────────────────────────────────────────

export async function addProjectImageAction(
  projectId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const file = formData.get('image') as File | null;
  if (!file || file.size === 0) return { error: 'La imagen es obligatoria' };

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await addProjectImage(
    {
      projectId,
      imageBuffer: buffer,
      imageMimeType: file.type,
      imageOriginalName: file.name,
      imageSize: file.size,
      alt: (formData.get('alt') as string) || undefined,
    },
    { repo: prismaProjectRepository, storage: localDiskStorage },
  );

  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/proyectos/${projectId}/edit`);
  return null;
}

export async function removeProjectImageAction(input: {
  imageId: string;
  imageKey: string;
}): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await removeProjectImage(input, { repo: prismaProjectRepository, storage: localDiskStorage });
  if (!result.ok) return { error: result.error };

  invalidateProjects();
  return null;
}

export async function reorderProjectImagesAction(input: {
  projectId: string;
  imageIds: string[];
}): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await reorderProjectImages(input, { repo: prismaProjectRepository });
  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/proyectos/${input.projectId}/edit`);
  return null;
}

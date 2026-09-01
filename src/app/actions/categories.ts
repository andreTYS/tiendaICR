'use server';

import { auth } from '@/modules/auth/infrastructure/authjs-config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createCategory } from '@/modules/categories/application/create-category';
import { updateCategory } from '@/modules/categories/application/update-category';
import { deleteCategory } from '@/modules/categories/application/delete-category';
import { prismaCategoryRepository } from '@/modules/categories/infrastructure/prisma-category-repository';
import type { Role } from '@/modules/auth/domain/user-role';

type ActionState = { error?: string } | null;

async function getRole(): Promise<Role | null> {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!role || !['ADMIN', 'EDITOR'].includes(role)) return null;
  return role;
}

function invalidateCategories() {
  revalidatePath('/admin/categorias');
  revalidatePath('/admin/proyectos');
  revalidatePath('/proyectos');
  revalidatePath('/en/proyectos');
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await createCategory(
    {
      nameEs: String(formData.get('nameEs') ?? ''),
      nameEn: (formData.get('nameEn') as string) || undefined,
      slug: (formData.get('slug') as string) || undefined,
    },
    { repo: prismaCategoryRepository },
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      VALIDATION: 'Datos inválidos',
      DUPLICATE_SLUG: 'El slug ya existe',
    };
    return { error: messages[result.error] ?? result.error };
  }

  invalidateCategories();
  redirect('/admin/categorias');
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCategoryAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await updateCategory(
    {
      id,
      patch: {
        nameEs: (formData.get('nameEs') as string) || undefined,
        nameEn: (formData.get('nameEn') as string) || undefined,
        slug: (formData.get('slug') as string) || undefined,
      },
    },
    { repo: prismaCategoryRepository },
  );

  if (!result.ok) {
    const messages: Record<string, string> = {
      NOT_FOUND: 'Categoría no encontrada',
      DUPLICATE_SLUG: 'El slug ya existe',
      VALIDATION: 'Datos inválidos',
    };
    return { error: messages[result.error] ?? result.error };
  }

  invalidateCategories();
  redirect('/admin/categorias');
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { error: 'Sin permisos' };

  const result = await deleteCategory({ id }, { repo: prismaCategoryRepository });

  if (!result.ok) {
    if (result.error === 'CATEGORY_IN_USE')
      return { error: 'La categoría tiene proyectos asociados. Reasigna los proyectos antes de eliminar.' };
    return { error: 'Categoría no encontrada' };
  }

  invalidateCategories();
  return null;
}

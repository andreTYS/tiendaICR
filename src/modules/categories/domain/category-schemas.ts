import { z } from 'zod';

export const CategoryCreateSchema = z.object({
  nameEs: z.string().min(1, { error: 'El nombre en español es obligatorio' }),
  nameEn: z.string().optional(),
  slug: z.string().optional(),
});

export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;

export const CategoryUpdateSchema = CategoryCreateSchema.partial();
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;

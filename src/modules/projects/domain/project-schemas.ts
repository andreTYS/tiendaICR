import { z } from 'zod';

export const ProjectCreateSchema = z.object({
  titleEs: z.string().min(1, { error: 'El título en español es obligatorio' }),
  titleEn: z.string().optional(),
  descEs: z.string().min(1, { error: 'La descripción en español es obligatoria' }),
  descEn: z.string().optional(),
  location: z.string().optional(),
  categoryId: z.string().min(1, { error: 'La categoría es obligatoria' }),
  slug: z.string().optional(),
  isActive: z.boolean().default(false),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;

export const ProjectUpdateSchema = ProjectCreateSchema.partial();
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;

export const ReorderProjectsSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});
export type ReorderProjectsInput = z.infer<typeof ReorderProjectsSchema>;

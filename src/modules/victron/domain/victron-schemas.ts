import { z } from "zod";

/** Tokens are 64 hex chars in practice; we accept 16+ to stay forward-compat. */
export const SaveVictronTokenSchema = z.object({
  token: z
    .string()
    .trim()
    .min(16, { error: "Token demasiado corto" })
    .max(512, { error: "Token demasiado largo" }),
});
export type SaveVictronTokenInput = z.infer<typeof SaveVictronTokenSchema>;

export const LinkVictronSiteSchema = z.object({
  projectId: z.string().min(1),
  idSite: z.coerce.number().int().positive(),
  displayName: z.string().trim().max(120).optional(),
});
export type LinkVictronSiteInput = z.infer<typeof LinkVictronSiteSchema>;

export const UpdateVictronSiteSchema = z.object({
  displayName: z.string().trim().max(120).optional(),
  isPublicMetrics: z.boolean().optional(),
  showPv: z.boolean().optional(),
  showBattery: z.boolean().optional(),
  showLoad: z.boolean().optional(),
  showGrid: z.boolean().optional(),
});
export type UpdateVictronSiteInput = z.infer<typeof UpdateVictronSiteSchema>;

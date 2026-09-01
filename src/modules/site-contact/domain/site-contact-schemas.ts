import { z } from 'zod';

/**
 * Accept an empty string OR a valid URL. Empty = "not configured / hide".
 * Used for every social network field.
 */
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => v === '' || /^https?:\/\//i.test(v),
    { message: 'Debe empezar con http:// o https://' },
  );

const optionalText = (max: number) => z.string().trim().max(max);

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: 'Email inválido',
  });

export const UpdateSiteContactSchema = z.object({
  phone: optionalText(60).optional(),
  whatsapp: optionalText(60).optional(),
  email: optionalEmail.optional(),
  addressLine: optionalText(200).optional(),
  addressCity: optionalText(120).optional(),
  cities: optionalText(200).optional(),
  instagramUrl: optionalUrl.optional(),
  facebookUrl: optionalUrl.optional(),
  linkedinUrl: optionalUrl.optional(),
  tiktokUrl: optionalUrl.optional(),
  youtubeUrl: optionalUrl.optional(),
  twitterUrl: optionalUrl.optional(),
});

export type UpdateSiteContactInput = z.infer<typeof UpdateSiteContactSchema>;

import { z } from 'zod';

/** Reject ASCII control characters (except tab, newline, carriage-return) */
const noControlChars = (s: string) => !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(s);

export const ContactSubmitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'Nombre muy corto (mínimo 2 caracteres)' })
    .max(100, { error: 'Nombre muy largo (máximo 100 caracteres)' })
    .refine(noControlChars, { error: 'Caracteres no válidos en el nombre' }),

  email: z.email({ error: 'Email inválido' }),

  phone: z
    .string()
    .trim()
    .max(30, { error: 'Teléfono muy largo' })
    .optional()
    .transform((v) => (v === '' ? undefined : v)),

  subject: z
    .string()
    .trim()
    .max(200, { error: 'Asunto muy largo' })
    .optional()
    .transform((v) => (v === '' ? undefined : v)),

  body: z
    .string()
    .trim()
    .min(10, { error: 'Mensaje demasiado corto (mínimo 10 caracteres)' })
    .max(2000, { error: 'Mensaje demasiado largo (máximo 2000 caracteres)' })
    .refine(noControlChars, { error: 'Caracteres no válidos en el mensaje' }),
});

export type ContactSubmitInput = z.infer<typeof ContactSubmitSchema>;

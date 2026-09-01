import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email({ error: "Email inválido" }),
  password: z.string().min(1, { error: "Contraseña requerida" }),
});

export const CreateUserSchema = z.object({
  email: z.email({ error: "Email inválido" }),
  password: z
    .string()
    .min(12, { error: "Mínimo 12 caracteres" })
    .regex(/\d/, { error: "Debe contener al menos un dígito" })
    .regex(/[^a-zA-Z0-9]/, {
      error: "Debe contener al menos un carácter especial",
    }),
  role: z.enum(["ADMIN", "EDITOR"]).default("EDITOR"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

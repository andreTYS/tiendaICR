import { z } from "zod";

export const CreateClientAccessSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().trim().toLowerCase().email({ error: "Email inválido" }),
});
export type CreateClientAccessInput = z.infer<typeof CreateClientAccessSchema>;

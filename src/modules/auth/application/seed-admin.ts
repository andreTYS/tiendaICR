import type { UserRepository } from "../domain/user-repository";
import type { PasswordHasher } from "../domain/password-hasher";
import type { SeedAdminError } from "../domain/user-errors";
import { CreateUserSchema } from "../domain/user-schemas";
import { ok, err, type Result } from "@/shared/lib/result";

export async function seedAdmin(
  input: { email: string; password: string },
  deps: { users: UserRepository; hasher: PasswordHasher }
): Promise<Result<{ id: string }, SeedAdminError>> {
  // Validate input
  const parsed = CreateUserSchema.safeParse({ ...input, role: "ADMIN" });
  if (!parsed.success) {
    return err("VALIDATION");
  }

  // Idempotent: skip if an ADMIN already exists
  const existing = await deps.users.countByRole("ADMIN");
  if (existing > 0) {
    return err("ALREADY_SEEDED");
  }

  const passwordHash = await deps.hasher.hash(parsed.data.password);
  const user = await deps.users.create({
    email: parsed.data.email,
    passwordHash,
    role: "ADMIN",
  });

  return ok({ id: user.id });
}

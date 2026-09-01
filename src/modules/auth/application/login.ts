import type { UserRepository } from "../domain/user-repository";
import type { PasswordHasher } from "../domain/password-hasher";
import type { Role } from "../domain/user-role";
import type { LoginError } from "../domain/user-errors";
import { LoginSchema } from "../domain/user-schemas";
import { ok, err, type Result } from "@/shared/lib/result";

export interface LoginOutput {
  id: string;
  email: string;
  role: Role;
}

export interface LoginDeps {
  users: UserRepository;
  hasher: PasswordHasher;
}

export async function login(
  input: { email: string; password: string },
  deps: LoginDeps
): Promise<Result<LoginOutput, LoginError>> {
  // 1. Validate input
  const parsed = LoginSchema.safeParse(input);
  if (!parsed.success) {
    return err("VALIDATION");
  }

  const { email, password } = parsed.data;

  // 2. Lookup user — never reveal whether email exists or not
  const user = await deps.users.findByEmail(email);
  if (!user) {
    return err("INVALID_CREDENTIALS");
  }

  // 3. Verify password
  const valid = await deps.hasher.verify(password, user.passwordHash);
  if (!valid) {
    return err("INVALID_CREDENTIALS");
  }

  return ok({ id: user.id, email: user.email, role: user.role });
}

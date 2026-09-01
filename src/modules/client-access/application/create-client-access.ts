/**
 * Provision a client portal account.
 *
 * Behaviour:
 *  - If a user with that email already exists, we keep them and ONLY grant
 *    access to the requested project. The returned `generatedPassword` is
 *    null in this case (admin re-uses the existing creds).
 *  - If no user exists, we create one with CLIENT role and a random
 *    one-shot password (returned exactly once to the admin UI).
 *
 * This is the only path that can mint CLIENT-role users. Existing
 * ADMIN/EDITOR users keep their role even if granted access (so an admin
 * can also "preview" a private project without role downgrade).
 */
import { randomBytes } from "node:crypto";
import { ok, err, type Result } from "@/shared/lib/result";
import type { Role } from "@/modules/auth/domain/user-role";
import { CreateClientAccessSchema } from "../domain/client-access-schemas";
import type { ClientAccessRepository } from "../domain/client-access-repository";
import type { UserRepository } from "@/modules/auth/domain/user-repository";
import type { PasswordHasher } from "@/modules/auth/domain/password-hasher";
import type { ProjectRepository } from "@/modules/projects/domain/project-repository";

export type CreateClientAccessError =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "PROJECT_NOT_FOUND";

export interface CreateClientAccessOutput {
  userId: string;
  email: string;
  /** Plaintext password — only present when we just created the user. */
  generatedPassword: string | null;
  alreadyHadAccess: boolean;
}

export interface CreateClientAccessDeps {
  accessRepo: ClientAccessRepository;
  userRepo: UserRepository;
  hasher: PasswordHasher;
  projectRepo: ProjectRepository;
}

export async function createClientAccess(
  input: { data: unknown; callerRole: Role },
  deps: CreateClientAccessDeps,
): Promise<Result<CreateClientAccessOutput, CreateClientAccessError>> {
  if (input.callerRole !== "ADMIN" && input.callerRole !== "EDITOR") {
    return err("UNAUTHORIZED");
  }

  const parsed = CreateClientAccessSchema.safeParse(input.data);
  if (!parsed.success) return err("VALIDATION");

  const project = await deps.projectRepo.findById(parsed.data.projectId);
  if (!project) return err("PROJECT_NOT_FOUND");

  let user = await deps.userRepo.findByEmail(parsed.data.email);
  let generatedPassword: string | null = null;

  if (!user) {
    generatedPassword = generateReadablePassword();
    user = await deps.userRepo.create({
      email: parsed.data.email,
      passwordHash: await deps.hasher.hash(generatedPassword),
      role: "CLIENT",
    });
  }

  const alreadyHadAccess = await deps.accessRepo.has(user.id, project.id);
  if (!alreadyHadAccess) {
    await deps.accessRepo.grant(user.id, project.id);
  }

  return ok({
    userId: user.id,
    email: user.email,
    generatedPassword,
    alreadyHadAccess,
  });
}

/**
 * 16-char password using a URL-safe alphabet that avoids easily confused
 * pairs (0/O, 1/l/I). Long enough for bcrypt while still easy to dictate
 * over the phone, which is the usual delivery channel here.
 */
function generateReadablePassword(length = 16): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const buf = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[buf[i] % alphabet.length];
  }
  return out;
}

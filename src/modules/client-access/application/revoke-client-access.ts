import { ok, err, type Result } from "@/shared/lib/result";
import type { Role } from "@/modules/auth/domain/user-role";
import type { ClientAccessRepository } from "../domain/client-access-repository";

export type RevokeClientAccessError = "UNAUTHORIZED";

export async function revokeClientAccess(
  input: { id: string; callerRole: Role },
  deps: { accessRepo: ClientAccessRepository },
): Promise<Result<true, RevokeClientAccessError>> {
  if (input.callerRole !== "ADMIN" && input.callerRole !== "EDITOR") {
    return err("UNAUTHORIZED");
  }
  await deps.accessRepo.revoke(input.id);
  return ok(true);
}

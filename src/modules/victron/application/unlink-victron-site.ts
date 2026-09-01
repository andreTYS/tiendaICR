import type { Role } from "@/modules/auth/domain/user-role";
import { ok, err, type Result } from "@/shared/lib/result";
import type { VictronSiteRepository } from "../domain/victron-repository";
import type { VictronError } from "../domain/victron-errors";

export async function unlinkVictronSite(
  input: { projectId: string; callerRole: Role },
  deps: { siteRepo: VictronSiteRepository },
): Promise<Result<true, VictronError>> {
  if (input.callerRole !== "ADMIN" && input.callerRole !== "EDITOR") {
    return err("UNAUTHORIZED");
  }
  await deps.siteRepo.unlink(input.projectId);
  return ok(true);
}

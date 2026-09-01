import type { Role } from "@/modules/auth/domain/user-role";
import { ok, err, type Result } from "@/shared/lib/result";
import { UpdateVictronSiteSchema } from "../domain/victron-schemas";
import type { VictronSiteRepository } from "../domain/victron-repository";
import type { VictronSite } from "../domain/victron-site";
import type { VictronError } from "../domain/victron-errors";

export async function updateVictronSite(
  input: { projectId: string; data: unknown; callerRole: Role },
  deps: { siteRepo: VictronSiteRepository },
): Promise<Result<VictronSite, VictronError>> {
  if (input.callerRole !== "ADMIN" && input.callerRole !== "EDITOR") {
    return err("UNAUTHORIZED");
  }

  const existing = await deps.siteRepo.findByProjectId(input.projectId);
  if (!existing) return err("SITE_NOT_FOUND");

  const parsed = UpdateVictronSiteSchema.safeParse(input.data);
  if (!parsed.success) return err("VALIDATION");

  const updated = await deps.siteRepo.update(input.projectId, parsed.data);
  return ok(updated);
}

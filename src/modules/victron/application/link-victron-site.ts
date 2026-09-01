import type { Role } from "@/modules/auth/domain/user-role";
import { ok, err, type Result } from "@/shared/lib/result";
import { LinkVictronSiteSchema } from "../domain/victron-schemas";
import type { VictronSiteRepository } from "../domain/victron-repository";
import type { VictronSite } from "../domain/victron-site";
import type { VictronError } from "../domain/victron-errors";
import type { ProjectRepository } from "@/modules/projects/domain/project-repository";

export interface LinkVictronSiteDeps {
  siteRepo: VictronSiteRepository;
  projectRepo: ProjectRepository;
}

export async function linkVictronSite(
  input: { data: unknown; callerRole: Role },
  deps: LinkVictronSiteDeps,
): Promise<Result<VictronSite, VictronError>> {
  if (input.callerRole !== "ADMIN" && input.callerRole !== "EDITOR") {
    return err("UNAUTHORIZED");
  }

  const parsed = LinkVictronSiteSchema.safeParse(input.data);
  if (!parsed.success) return err("VALIDATION");

  const project = await deps.projectRepo.findById(parsed.data.projectId);
  if (!project) return err("PROJECT_NOT_FOUND");

  // Guard against linking the same idSite to two different projects.
  const existingByIdSite = await deps.siteRepo.findByIdSite(parsed.data.idSite);
  if (existingByIdSite && existingByIdSite.projectId !== parsed.data.projectId) {
    return err("ALREADY_LINKED");
  }

  const site = await deps.siteRepo.link({
    projectId: parsed.data.projectId,
    idSite: parsed.data.idSite,
    displayName: parsed.data.displayName ?? null,
  });
  return ok(site);
}

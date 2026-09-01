import { ok, type Result } from "@/shared/lib/result";
import type { ClientAccessRepository } from "../domain/client-access-repository";
import type { ClientAccessWithProject, ClientAccessWithUser } from "../domain/client-access";

export async function listClientAccessesByProject(
  input: { projectId: string },
  deps: { accessRepo: ClientAccessRepository },
): Promise<Result<ClientAccessWithUser[], never>> {
  const list = await deps.accessRepo.listByProject(input.projectId);
  return ok(list);
}

export async function listClientAccessesByUser(
  input: { userId: string },
  deps: { accessRepo: ClientAccessRepository },
): Promise<Result<ClientAccessWithProject[], never>> {
  const list = await deps.accessRepo.listByUser(input.userId);
  return ok(list);
}

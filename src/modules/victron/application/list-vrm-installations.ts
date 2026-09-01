import type { Role } from "@/modules/auth/domain/user-role";
import { ok, err, type Result } from "@/shared/lib/result";
import type { VictronConfigRepository } from "../domain/victron-repository";
import type { VrmClient } from "../domain/vrm-client";
import type { VictronError } from "../domain/victron-errors";
import type { VictronInstallationSummary } from "../domain/victron-site";

export async function listVrmInstallations(
  input: { callerRole: Role },
  deps: { configRepo: VictronConfigRepository; vrm: VrmClient },
): Promise<Result<VictronInstallationSummary[], VictronError>> {
  if (input.callerRole !== "ADMIN" && input.callerRole !== "EDITOR") {
    return err("UNAUTHORIZED");
  }

  const token = await deps.configRepo.getDecryptedToken();
  if (!token) return err("TOKEN_NOT_CONFIGURED");

  // /users/me first so we have the userId for the installations call —
  // VRM does not expose a "list mine" endpoint, you must pass the user id.
  let userId: number;
  try {
    const me = await deps.vrm.whoami(token);
    userId = me.id;
  } catch {
    return err("TOKEN_INVALID");
  }

  try {
    const list = await deps.vrm.listInstallations(token, userId);
    return ok(list);
  } catch {
    return err("VRM_API_ERROR");
  }
}

import type { Role } from "@/modules/auth/domain/user-role";
import { ok, err, type Result } from "@/shared/lib/result";
import type { VictronConfigRepository } from "../domain/victron-repository";
import type { VictronConfigState } from "../domain/victron-config";
import type { VictronError } from "../domain/victron-errors";

export async function clearVictronToken(
  input: { callerRole: Role },
  deps: { configRepo: VictronConfigRepository },
): Promise<Result<VictronConfigState, VictronError>> {
  if (input.callerRole !== "ADMIN") return err("UNAUTHORIZED");
  const state = await deps.configRepo.clearToken();
  return ok(state);
}

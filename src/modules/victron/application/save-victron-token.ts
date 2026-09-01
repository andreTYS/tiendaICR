import type { Role } from "@/modules/auth/domain/user-role";
import { ok, err, type Result } from "@/shared/lib/result";
import { SaveVictronTokenSchema } from "../domain/victron-schemas";
import type { VictronConfigRepository } from "../domain/victron-repository";
import type { VrmClient } from "../domain/vrm-client";
import type { VictronConfigState } from "../domain/victron-config";
import type { VictronError } from "../domain/victron-errors";

export interface SaveVictronTokenDeps {
  configRepo: VictronConfigRepository;
  vrm: VrmClient;
}

export async function saveVictronToken(
  input: { token: string; callerRole: Role },
  deps: SaveVictronTokenDeps,
): Promise<Result<VictronConfigState, VictronError>> {
  if (input.callerRole !== "ADMIN") return err("UNAUTHORIZED");

  const parsed = SaveVictronTokenSchema.safeParse({ token: input.token });
  if (!parsed.success) return err("VALIDATION");

  // Probe the token before persisting — we never want to save garbage.
  let identity: { id: number; name: string; email: string } | null = null;
  try {
    identity = await deps.vrm.whoami(parsed.data.token);
  } catch {
    return err("TOKEN_INVALID");
  }

  const state = await deps.configRepo.saveToken({
    token: parsed.data.token,
    identity,
    testOk: true,
  });
  return ok(state);
}

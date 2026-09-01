/**
 * VictronConfig — singleton (id = 1) holding the encrypted API token used to
 * talk to vrmapi.victronenergy.com. The plaintext token is NEVER kept in
 * memory longer than the request that needs it and NEVER returned to the
 * client; only metadata (whether it is set, last test info) is exposed.
 */
export interface VictronConfigState {
  id: 1;
  isConfigured: boolean;
  victronUserId: number | null;
  victronUserName: string | null;
  victronEmail: string | null;
  lastTestedAt: Date | null;
  lastTestOk: boolean;
  updatedAt: Date;
}

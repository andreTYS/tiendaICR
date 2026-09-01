import type { SettingsRepository } from '../domain/settings-repository';
import type { Settings } from '../domain/settings';
import { ok, type Result } from '@/shared/lib/result';

export interface GetSettingsDeps {
  repo: SettingsRepository;
}

export async function getSettings(
  deps: GetSettingsDeps,
): Promise<Result<Settings, never>> {
  const settings = await deps.repo.get();
  return ok(settings);
}

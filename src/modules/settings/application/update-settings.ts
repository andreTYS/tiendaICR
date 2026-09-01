import type { SettingsRepository } from '../domain/settings-repository';
import type { Settings } from '../domain/settings';
import type { Role } from '@/modules/auth/domain/user-role';
import { UpdateSettingsSchema } from '../domain/settings-schemas';
import { ok, err, type Result } from '@/shared/lib/result';

export type UpdateSettingsError =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'WOULD_DEACTIVATE_BANNERS';

export interface UpdateSettingsDeps {
  repo: SettingsRepository;
  countActiveBanners: () => Promise<number>;
}

export interface UpdateSettingsCallInput {
  data: {
    heroDisplayMode?: string;
    maxActiveBanners?: number;
    animIntensity?: number;
    defaultLocale?: string;
  };
  callerRole: Role;
}

export async function updateSettings(
  input: UpdateSettingsCallInput,
  deps: UpdateSettingsDeps,
): Promise<Result<Settings, UpdateSettingsError>> {
  // 1. Auth guard — settings is ADMIN-only
  if (input.callerRole !== 'ADMIN') {
    return err('UNAUTHORIZED');
  }

  // 2. Validate input shape and constraints
  const parsed = UpdateSettingsSchema.safeParse(input.data);
  if (!parsed.success) {
    return err('VALIDATION');
  }

  // 3. Guard against lowering maxActiveBanners below current active count
  if (parsed.data.maxActiveBanners !== undefined) {
    const activeCount = await deps.countActiveBanners();
    if (parsed.data.maxActiveBanners < activeCount) {
      return err('WOULD_DEACTIVATE_BANNERS');
    }
  }

  // 4. Persist and return updated settings
  const updated = await deps.repo.update(parsed.data);
  return ok(updated);
}

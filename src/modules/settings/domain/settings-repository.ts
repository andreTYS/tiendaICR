import type { Settings } from './settings';
import type { UpdateSettingsInput } from './settings-schemas';

export interface SettingsRepository {
  /** Always returns a Settings row — upserts with defaults if row is missing. */
  get(): Promise<Settings>;
  update(input: UpdateSettingsInput): Promise<Settings>;
}

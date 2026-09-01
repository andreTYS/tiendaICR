import type { SettingsRepository } from '../../domain/settings-repository';
import type { Settings } from '../../domain/settings';
import type { UpdateSettingsInput } from '../../domain/settings-schemas';
import { SETTINGS_DEFAULTS } from '../../domain/settings';

export class InMemorySettingsRepository implements SettingsRepository {
  private row: Settings = {
    id: 1,
    ...SETTINGS_DEFAULTS,
    updatedAt: new Date(),
  };

  async get(): Promise<Settings> {
    return { ...this.row };
  }

  async update(input: UpdateSettingsInput): Promise<Settings> {
    this.row = { ...this.row, ...input, updatedAt: new Date() };
    return { ...this.row };
  }

  /** Test helper — seed a specific state */
  seed(partial: Partial<Omit<Settings, 'id'>>): void {
    this.row = { ...this.row, ...partial };
  }
}

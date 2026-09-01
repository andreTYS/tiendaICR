import type { SiteContact } from './site-contact';
import type { UpdateSiteContactInput } from './site-contact-schemas';

export interface SiteContactRepository {
  /** Always returns a SiteContact row — upserts with empty defaults if missing. */
  get(): Promise<SiteContact>;
  update(input: UpdateSiteContactInput): Promise<SiteContact>;
}

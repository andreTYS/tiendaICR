import type { SiteContactRepository } from '../domain/site-contact-repository';
import type { SiteContact } from '../domain/site-contact';
import { ok, type Result } from '@/shared/lib/result';

export interface GetSiteContactDeps {
  repo: SiteContactRepository;
}

export async function getSiteContact(
  deps: GetSiteContactDeps,
): Promise<Result<SiteContact, never>> {
  const contact = await deps.repo.get();
  return ok(contact);
}

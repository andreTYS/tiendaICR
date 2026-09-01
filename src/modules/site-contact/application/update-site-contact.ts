import type { SiteContactRepository } from '../domain/site-contact-repository';
import type { SiteContact } from '../domain/site-contact';
import type { Role } from '@/modules/auth/domain/user-role';
import { UpdateSiteContactSchema } from '../domain/site-contact-schemas';
import { ok, err, type Result } from '@/shared/lib/result';

export type UpdateSiteContactError = 'VALIDATION' | 'UNAUTHORIZED';

export interface UpdateSiteContactDeps {
  repo: SiteContactRepository;
}

export interface UpdateSiteContactCallInput {
  data: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    addressLine?: string;
    addressCity?: string;
    cities?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    linkedinUrl?: string;
    tiktokUrl?: string;
    youtubeUrl?: string;
    twitterUrl?: string;
  };
  callerRole: Role;
}

export async function updateSiteContact(
  input: UpdateSiteContactCallInput,
  deps: UpdateSiteContactDeps,
): Promise<Result<SiteContact, UpdateSiteContactError>> {
  if (input.callerRole !== 'ADMIN' && input.callerRole !== 'EDITOR') {
    return err('UNAUTHORIZED');
  }

  const parsed = UpdateSiteContactSchema.safeParse(input.data);
  if (!parsed.success) {
    return err('VALIDATION');
  }

  const updated = await deps.repo.update(parsed.data);
  return ok(updated);
}

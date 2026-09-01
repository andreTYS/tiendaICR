import { ok, err, type Result } from '@/shared/lib/result';
import type { ContactMessage } from '../domain/contact-message';
import type { ContactMessageRepository } from '../domain/contact-message-repository';
import type { ContactError } from '../domain/contact-errors';

interface Deps {
  repo: ContactMessageRepository;
}

export async function markContactAsRead(
  input: { id: string },
  deps: Deps,
): Promise<Result<ContactMessage, ContactError>> {
  const updated = await deps.repo.markAsRead(input.id);
  if (!updated) return err('NOT_FOUND' as ContactError);
  return ok(updated);
}

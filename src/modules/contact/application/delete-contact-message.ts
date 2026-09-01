import { ok, err, type Result } from '@/shared/lib/result';
import type { ContactMessageRepository } from '../domain/contact-message-repository';
import type { ContactError } from '../domain/contact-errors';

interface Deps {
  repo: ContactMessageRepository;
}

export async function deleteContactMessage(
  input: { id: string },
  deps: Deps,
): Promise<Result<void, ContactError>> {
  const existing = await deps.repo.findById(input.id);
  if (!existing) return err('NOT_FOUND' as ContactError);
  await deps.repo.delete(input.id);
  return ok(undefined);
}

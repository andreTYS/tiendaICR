import { ok, type Result } from '@/shared/lib/result';
import type { ContactMessage } from '../domain/contact-message';
import type { ContactMessageRepository } from '../domain/contact-message-repository';

interface Deps {
  repo: ContactMessageRepository;
}

export async function listContactMessages(
  deps: Deps,
): Promise<Result<ContactMessage[], never>> {
  const messages = await deps.repo.findAll();
  return ok(messages);
}

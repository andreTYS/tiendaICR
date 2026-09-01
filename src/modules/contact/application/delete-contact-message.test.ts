import { describe, it, expect, vi } from 'vitest';
import { deleteContactMessage } from './delete-contact-message';
import type { ContactMessageRepository } from '../domain/contact-message-repository';
import type { ContactMessage } from '../domain/contact-message';

const makeMsg = (): ContactMessage => ({
  id: 'msg-1',
  name: 'Juan',
  email: 'juan@example.com',
  body: 'Hola mundo mensaje largo',
  createdAt: new Date(),
});

describe('deleteContactMessage', () => {
  it('calls repo.delete and returns ok when message exists', async () => {
    const repo: ContactMessageRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(makeMsg()),
      markAsRead: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const result = await deleteContactMessage({ id: 'msg-1' }, { repo });
    expect(result.ok).toBe(true);
    expect(repo.delete).toHaveBeenCalledWith('msg-1');
  });

  it('returns NOT_FOUND when message does not exist', async () => {
    const repo: ContactMessageRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      markAsRead: vi.fn(),
      delete: vi.fn(),
    };
    const result = await deleteContactMessage({ id: 'missing' }, { repo });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('NOT_FOUND');
    expect(repo.delete).not.toHaveBeenCalled();
  });
});

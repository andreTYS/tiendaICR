import { describe, it, expect, vi } from 'vitest';
import { markContactAsRead } from './mark-contact-as-read';
import type { ContactMessageRepository } from '../domain/contact-message-repository';
import type { ContactMessage } from '../domain/contact-message';

const makeMsg = (overrides: Partial<ContactMessage> = {}): ContactMessage => ({
  id: 'msg-1',
  name: 'Juan',
  email: 'juan@example.com',
  body: 'Hola mundo mensaje largo',
  createdAt: new Date(),
  ...overrides,
});

describe('markContactAsRead', () => {
  it('returns ok with updated message when found', async () => {
    const updated = makeMsg({ readAt: new Date() });
    const repo: ContactMessageRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      markAsRead: vi.fn().mockResolvedValue(updated),
      delete: vi.fn(),
    };
    const result = await markContactAsRead({ id: 'msg-1' }, { repo });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.readAt).toBeDefined();
    expect(repo.markAsRead).toHaveBeenCalledWith('msg-1');
  });

  it('returns NOT_FOUND when message does not exist', async () => {
    const repo: ContactMessageRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      markAsRead: vi.fn().mockResolvedValue(null),
      delete: vi.fn(),
    };
    const result = await markContactAsRead({ id: 'missing' }, { repo });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('NOT_FOUND');
  });
});

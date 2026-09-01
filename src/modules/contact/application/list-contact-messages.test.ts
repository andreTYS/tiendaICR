import { describe, it, expect, vi } from 'vitest';
import { listContactMessages } from './list-contact-messages';
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

describe('listContactMessages', () => {
  it('returns all messages from the repo', async () => {
    const msgs = [makeMsg({ id: '1' }), makeMsg({ id: '2' })];
    const repo: ContactMessageRepository = {
      create: vi.fn(),
      findAll: vi.fn().mockResolvedValue(msgs),
      findById: vi.fn(),
      markAsRead: vi.fn(),
      delete: vi.fn(),
    };
    const result = await listContactMessages({ repo });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toHaveLength(2);
    expect(repo.findAll).toHaveBeenCalledOnce();
  });

  it('returns empty array when no messages exist', async () => {
    const repo: ContactMessageRepository = {
      create: vi.fn(),
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      markAsRead: vi.fn(),
      delete: vi.fn(),
    };
    const result = await listContactMessages({ repo });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toHaveLength(0);
  });
});

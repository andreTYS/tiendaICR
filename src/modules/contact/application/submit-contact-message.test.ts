import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitContactMessage } from './submit-contact-message';
import type { ContactMessageRepository } from '../domain/contact-message-repository';
import type { EmailSender } from '../domain/email-sender';
import type { ContactMessage } from '../domain/contact-message';

const makeMsg = (overrides: Partial<ContactMessage> = {}): ContactMessage => ({
  id: 'msg-1',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  body: 'Hola, me interesa instalar paneles solares',
  createdAt: new Date(),
  ...overrides,
});

const makeRepo = (): ContactMessageRepository => ({
  create: vi.fn().mockResolvedValue(makeMsg()),
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  markAsRead: vi.fn().mockResolvedValue(null),
  delete: vi.fn().mockResolvedValue(undefined),
});

const makeEmailSender = (): EmailSender => ({
  sendAdminNotification: vi.fn().mockResolvedValue(undefined),
});

describe('submitContactMessage', () => {
  let repo: ContactMessageRepository;
  let emailSender: EmailSender;

  beforeEach(() => {
    repo = makeRepo();
    emailSender = makeEmailSender();
  });

  it('persists a valid message and returns ok', async () => {
    const result = await submitContactMessage(
      { name: 'Juan Pérez', email: 'juan@example.com', body: 'Hola, me interesa instalar paneles solares' },
      { repo, emailSender, sendEmail: false },
    );
    expect(result.ok).toBe(true);
    expect(repo.create).toHaveBeenCalledOnce();
  });

  it('returns VALIDATION error for body shorter than 10 chars', async () => {
    const result = await submitContactMessage(
      { name: 'Juan', email: 'juan@example.com', body: 'Corto' },
      { repo, emailSender, sendEmail: false },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('VALIDATION');
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('returns VALIDATION error for invalid email', async () => {
    const result = await submitContactMessage(
      { name: 'Juan', email: 'not-an-email', body: 'Mensaje válido suficientemente largo' },
      { repo, emailSender, sendEmail: false },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('VALIDATION');
  });

  it('returns VALIDATION error for name shorter than 2 chars', async () => {
    const result = await submitContactMessage(
      { name: 'J', email: 'juan@example.com', body: 'Mensaje válido suficientemente largo' },
      { repo, emailSender, sendEmail: false },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('VALIDATION');
  });

  it('calls emailSender when sendEmail is true', async () => {
    await submitContactMessage(
      { name: 'Juan', email: 'juan@example.com', body: 'Mensaje válido suficientemente largo' },
      { repo, emailSender, sendEmail: true },
    );
    expect(emailSender.sendAdminNotification).toHaveBeenCalledOnce();
  });

  it('does NOT call emailSender when sendEmail is false', async () => {
    await submitContactMessage(
      { name: 'Juan', email: 'juan@example.com', body: 'Mensaje válido suficientemente largo' },
      { repo, emailSender, sendEmail: false },
    );
    expect(emailSender.sendAdminNotification).not.toHaveBeenCalled();
  });

  it('trims whitespace from name and body before persisting', async () => {
    await submitContactMessage(
      { name: '  Juan  ', email: 'juan@example.com', body: '  Mensaje válido suficientemente largo  ' },
      { repo, emailSender, sendEmail: false },
    );
    const callArg = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.name).toBe('Juan');
    expect(callArg.body).toBe('Mensaje válido suficientemente largo');
  });

  it('passes ipHash through to the repository', async () => {
    await submitContactMessage(
      { name: 'Juan', email: 'juan@example.com', body: 'Mensaje válido suficientemente largo', ipHash: 'abc123' },
      { repo, emailSender, sendEmail: false },
    );
    const callArg = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.ipHash).toBe('abc123');
  });

  it('returns ok with the created message', async () => {
    const created = makeMsg({ id: 'new-id' });
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue(created);
    const result = await submitContactMessage(
      { name: 'Juan', email: 'juan@example.com', body: 'Mensaje válido suficientemente largo' },
      { repo, emailSender, sendEmail: false },
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.id).toBe('new-id');
  });
});

import { prisma } from '@/shared/lib/prisma';
import type { ContactMessage, ContactMessageData } from '../domain/contact-message';
import type { ContactMessageRepository } from '../domain/contact-message-repository';

function toEntity(row: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  body: string;
  ipHash: string | null;
  readAt: Date | null;
  createdAt: Date;
}): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    subject: row.subject ?? undefined,
    body: row.body,
    ipHash: row.ipHash ?? undefined,
    readAt: row.readAt ?? undefined,
    createdAt: row.createdAt,
  };
}

export const prismaContactRepository: ContactMessageRepository = {
  async create(data: ContactMessageData): Promise<ContactMessage> {
    const row = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        subject: data.subject ?? null,
        body: data.body,
        ipHash: data.ipHash ?? null,
      },
    });
    return toEntity(row);
  },

  async findAll(): Promise<ContactMessage[]> {
    const rows = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toEntity);
  },

  async findById(id: string): Promise<ContactMessage | null> {
    const row = await prisma.contactMessage.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  },

  async markAsRead(id: string): Promise<ContactMessage | null> {
    try {
      const row = await prisma.contactMessage.update({
        where: { id },
        data: { readAt: new Date() },
      });
      return toEntity(row);
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<void> {
    await prisma.contactMessage.delete({ where: { id } });
  },
};

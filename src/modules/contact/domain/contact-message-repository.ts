import type { ContactMessage, ContactMessageData } from './contact-message';

export interface ContactMessageRepository {
  create(data: ContactMessageData): Promise<ContactMessage>;
  findAll(): Promise<ContactMessage[]>;
  findById(id: string): Promise<ContactMessage | null>;
  markAsRead(id: string): Promise<ContactMessage | null>;
  delete(id: string): Promise<void>;
}

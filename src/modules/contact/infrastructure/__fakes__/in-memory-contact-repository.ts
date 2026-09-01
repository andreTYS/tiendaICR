import type { ContactMessage, ContactMessageData } from '../../domain/contact-message';
import type { ContactMessageRepository } from '../../domain/contact-message-repository';

let idCounter = 1;

export class InMemoryContactRepository implements ContactMessageRepository {
  private messages: ContactMessage[] = [];

  async create(data: ContactMessageData): Promise<ContactMessage> {
    const message: ContactMessage = {
      ...data,
      id: String(idCounter++),
      createdAt: new Date(),
    };
    this.messages.push(message);
    return { ...message };
  }

  async findAll(): Promise<ContactMessage[]> {
    return [...this.messages].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async findById(id: string): Promise<ContactMessage | null> {
    return this.messages.find((m) => m.id === id) ?? null;
  }

  async markAsRead(id: string): Promise<ContactMessage | null> {
    const index = this.messages.findIndex((m) => m.id === id);
    if (index === -1) return null;
    this.messages[index] = { ...this.messages[index]!, readAt: new Date() };
    return { ...this.messages[index]! };
  }

  async delete(id: string): Promise<void> {
    this.messages = this.messages.filter((m) => m.id !== id);
  }

  /** Test helper — reset state */
  clear(): void {
    this.messages = [];
    idCounter = 1;
  }

  /** Test helper — seed data */
  seed(data: ContactMessageData[]): void {
    for (const d of data) {
      this.messages.push({
        ...d,
        id: String(idCounter++),
        createdAt: new Date(),
      });
    }
  }
}

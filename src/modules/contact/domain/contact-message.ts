export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  body: string;
  ipHash?: string;
  readAt?: Date;
  createdAt: Date;
}

export interface ContactMessageData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  body: string;
  ipHash?: string;
  readAt?: Date;
}

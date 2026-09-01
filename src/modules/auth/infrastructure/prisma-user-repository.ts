import type { UserRepository } from "../domain/user-repository";
import type { User, UserListItem } from "../domain/user";
import type { Role } from "../domain/user-role";
import { prisma } from "@/shared/lib/prisma";

export const prismaUserRepository: UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return mapUser(user);
  },

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return mapUser(user);
  },

  async create(input: {
    email: string;
    passwordHash: string;
    role: Role;
  }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
      },
    });
    return mapUser(user);
  },

  async list(): Promise<UserListItem[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role as Role,
      createdAt: u.createdAt,
    }));
  },

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },

  async countByRole(role: Role): Promise<number> {
    return prisma.user.count({ where: { role } });
  },
};

function mapUser(raw: {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: raw.id,
    email: raw.email,
    passwordHash: raw.passwordHash,
    role: raw.role as Role,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

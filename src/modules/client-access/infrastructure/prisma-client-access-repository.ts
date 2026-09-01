import { prisma } from "@/shared/lib/prisma";
import type { ClientAccessRepository } from "../domain/client-access-repository";

export const prismaClientAccessRepository: ClientAccessRepository = {
  async listByProject(projectId) {
    const rows = await prisma.clientAccess.findMany({
      where: { projectId },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      projectId: r.projectId,
      createdAt: r.createdAt,
      user: { id: r.user.id, email: r.user.email },
    }));
  },

  async listByUser(userId) {
    const rows = await prisma.clientAccess.findMany({
      where: { userId },
      include: {
        project: {
          select: { id: true, slug: true, titleEs: true, mainImageKey: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      projectId: r.projectId,
      createdAt: r.createdAt,
      project: {
        id: r.project.id,
        slug: r.project.slug,
        titleEs: r.project.titleEs,
        mainImageKey: r.project.mainImageKey,
      },
    }));
  },

  async has(userId, projectId) {
    const row = await prisma.clientAccess.findUnique({
      where: { userId_projectId: { userId, projectId } },
      select: { id: true },
    });
    return Boolean(row);
  },

  async grant(userId, projectId) {
    const row = await prisma.clientAccess.upsert({
      where: { userId_projectId: { userId, projectId } },
      create: { userId, projectId },
      update: {},
    });
    return {
      id: row.id,
      userId: row.userId,
      projectId: row.projectId,
      createdAt: row.createdAt,
    };
  },

  async revoke(id) {
    await prisma.clientAccess.delete({ where: { id } }).catch(() => undefined);
  },
};

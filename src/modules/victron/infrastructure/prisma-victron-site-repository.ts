import { prisma } from "@/shared/lib/prisma";
import type { VictronSiteRepository } from "../domain/victron-repository";
import type { VictronSite } from "../domain/victron-site";
import type { VictronSnapshot } from "../domain/victron-snapshot";

interface PrismaRow {
  id: string;
  projectId: string;
  idSite: number;
  displayName: string | null;
  isPublicMetrics: boolean;
  showPv: boolean;
  showBattery: boolean;
  showLoad: boolean;
  showGrid: boolean;
  lastSyncAt: Date | null;
  lastSnapshot: unknown;
  createdAt: Date;
  updatedAt: Date;
}

function toDomain(row: PrismaRow): VictronSite {
  return {
    id: row.id,
    projectId: row.projectId,
    idSite: row.idSite,
    displayName: row.displayName,
    isPublicMetrics: row.isPublicMetrics,
    showPv: row.showPv,
    showBattery: row.showBattery,
    showLoad: row.showLoad,
    showGrid: row.showGrid,
    lastSyncAt: row.lastSyncAt,
    lastSnapshot: row.lastSnapshot ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const prismaVictronSiteRepository: VictronSiteRepository = {
  async findByProjectId(projectId) {
    const row = await prisma.victronSite.findUnique({ where: { projectId } });
    return row ? toDomain(row) : null;
  },

  async findByIdSite(idSite) {
    const row = await prisma.victronSite.findUnique({ where: { idSite } });
    return row ? toDomain(row) : null;
  },

  async link({ projectId, idSite, displayName }) {
    const row = await prisma.victronSite.upsert({
      where: { projectId },
      create: {
        projectId,
        idSite,
        displayName: displayName ?? null,
      },
      update: {
        idSite,
        displayName: displayName ?? null,
      },
    });
    return toDomain(row);
  },

  async update(projectId, patch) {
    const row = await prisma.victronSite.update({
      where: { projectId },
      data: patch,
    });
    return toDomain(row);
  },

  async unlink(projectId) {
    await prisma.victronSite.delete({ where: { projectId } }).catch(() => undefined);
  },

  async saveSnapshot(projectId, snapshot: VictronSnapshot) {
    await prisma.victronSite.update({
      where: { projectId },
      data: {
        lastSnapshot: snapshot as unknown as object,
        lastSyncAt: new Date(),
      },
    });
  },
};

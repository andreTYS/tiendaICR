import { prisma } from "@/shared/lib/prisma";
import { decryptSecret, encryptSecret } from "@/shared/lib/crypto";
import type { VictronConfigRepository } from "../domain/victron-repository";
import type { VictronConfigState } from "../domain/victron-config";

interface PrismaRow {
  id: number;
  encryptedToken: string;
  tokenIv: string;
  tokenTag: string;
  victronUserId: number | null;
  victronUserName: string | null;
  victronEmail: string | null;
  lastTestedAt: Date | null;
  lastTestOk: boolean;
  updatedAt: Date;
}

function toState(row: PrismaRow): VictronConfigState {
  return {
    id: 1,
    isConfigured: Boolean(row.encryptedToken && row.tokenIv && row.tokenTag),
    victronUserId: row.victronUserId,
    victronUserName: row.victronUserName,
    victronEmail: row.victronEmail,
    lastTestedAt: row.lastTestedAt,
    lastTestOk: row.lastTestOk,
    updatedAt: row.updatedAt,
  };
}

async function ensureRow(): Promise<PrismaRow> {
  return prisma.victronConfig.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
}

export const prismaVictronConfigRepository: VictronConfigRepository = {
  async getState() {
    return toState(await ensureRow());
  },

  async getDecryptedToken() {
    const row = await ensureRow();
    if (!row.encryptedToken || !row.tokenIv || !row.tokenTag) return null;
    try {
      return decryptSecret({
        ciphertext: row.encryptedToken,
        iv: row.tokenIv,
        authTag: row.tokenTag,
      });
    } catch {
      // Token unreadable (likely AUTH_SECRET rotated). Treat as "not configured"
      // rather than crashing every request that touches Victron.
      return null;
    }
  },

  async saveToken({ token, identity, testOk }) {
    const enc = encryptSecret(token);
    const row = await prisma.victronConfig.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        encryptedToken: enc.ciphertext,
        tokenIv: enc.iv,
        tokenTag: enc.authTag,
        victronUserId: identity?.id ?? null,
        victronUserName: identity?.name ?? null,
        victronEmail: identity?.email ?? null,
        lastTestedAt: new Date(),
        lastTestOk: testOk,
      },
      update: {
        encryptedToken: enc.ciphertext,
        tokenIv: enc.iv,
        tokenTag: enc.authTag,
        victronUserId: identity?.id ?? null,
        victronUserName: identity?.name ?? null,
        victronEmail: identity?.email ?? null,
        lastTestedAt: new Date(),
        lastTestOk: testOk,
      },
    });
    return toState(row);
  },

  async clearToken() {
    const row = await prisma.victronConfig.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {
        encryptedToken: "",
        tokenIv: "",
        tokenTag: "",
        victronUserId: null,
        victronUserName: null,
        victronEmail: null,
        lastTestedAt: null,
        lastTestOk: false,
      },
    });
    return toState(row);
  },
};

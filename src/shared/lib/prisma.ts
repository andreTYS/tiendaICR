/**
 * PrismaClient singleton (Prisma v7 + @prisma/adapter-pg) — lazy.
 *
 * Why a Proxy: Next 16's `next build` imports route modules during the
 * "Collecting page data" phase. If this module instantiated PrismaClient
 * at import time, it would throw when DATABASE_URL is absent — which is
 * the correct state during build (secrets are runtime-only). The Proxy
 * defers instantiation to the first property access, which only happens
 * when a route actually runs a query.
 *
 * PrismaPg manages the pg Pool internally when given a connection string.
 * The globalThis guard prevents connection pool exhaustion during
 * Next.js hot-reload in development.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Make sure .env / .env.local is loaded before using prisma."
    );
  }

  const adapter = new PrismaPg(url);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

type GlobalWithPrisma = typeof globalThis & { __prisma?: PrismaClient };
const g = globalThis as GlobalWithPrisma;

function getClient(): PrismaClient {
  if (g.__prisma) return g.__prisma;
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    g.__prisma = client;
  } else {
    // In production, still cache on the module scope via globalThis so
    // repeated property access on the proxy doesn't re-instantiate.
    g.__prisma = client;
  }
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
  has(_target, prop) {
    return Reflect.has(getClient(), prop);
  },
});

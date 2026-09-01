/**
 * Prisma v7 configuration file.
 * The datasource URL lives here (not in schema.prisma).
 * Used by `prisma migrate dev`, `prisma migrate deploy`, and `prisma db push`.
 *
 * Env loading order (first non-empty wins):
 *   1. process.env (already set, e.g. CI secrets)
 *   2. .env.local  (dev overrides — matches Next.js convention)
 *   3. .env        (committed defaults / prod in Docker)
 *
 * We use Node's native loadEnvFile (Node 20.12+) so no dotenv dep is needed.
 * `prisma generate` can still run without DATABASE_URL being set.
 */
import { loadEnvFile } from "node:process";
import { defineConfig } from "prisma/config";

for (const file of [".env.local", ".env"]) {
  try {
    loadEnvFile(file);
  } catch {
    // File missing or already loaded — ignore.
  }
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

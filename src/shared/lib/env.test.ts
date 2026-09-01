/**
 * TDD: env validation — RED phase
 * Tests written BEFORE implementation.
 * All required vars must cause a thrown error if missing.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Store original env to restore after each test
const originalEnv = { ...process.env };

function buildValidEnv(): Record<string, string> {
  return {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/icr",
    AUTH_SECRET: "a-very-long-secret-that-is-at-least-32-chars-long!",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    NODE_ENV: "test",
  };
}

function loadEnv(overrides: Record<string, string | undefined> = {}) {
  // Clear module cache so env.ts re-evaluates process.env
  vi.resetModules();
  Object.assign(process.env, buildValidEnv(), overrides);
  // Remove keys explicitly set to undefined
  for (const [key, val] of Object.entries(overrides)) {
    if (val === undefined) delete process.env[key];
  }
  return import("./env");
}

beforeEach(() => {
  // wipe env before each test
  for (const key of Object.keys(process.env)) {
    delete process.env[key];
  }
});

afterEach(() => {
  Object.assign(process.env, originalEnv);
  vi.resetModules();
});

describe("env validation", () => {
  it("parses successfully when all required vars are present", async () => {
    const { env } = await loadEnv();
    expect(env.DATABASE_URL).toBe("postgresql://user:pass@localhost:5432/icr");
    expect(env.AUTH_SECRET).toBe(
      "a-very-long-secret-that-is-at-least-32-chars-long!"
    );
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });

  // env is a lazy Proxy: validation runs on first property access, not at
  // import. Import never throws — accessing env.X does.

  it("throws when DATABASE_URL is missing", async () => {
    const { env } = await loadEnv({ DATABASE_URL: undefined });
    expect(() => env.DATABASE_URL).toThrow();
  });

  it("throws when AUTH_SECRET is missing", async () => {
    const { env } = await loadEnv({ AUTH_SECRET: undefined });
    expect(() => env.AUTH_SECRET).toThrow();
  });

  it("throws when AUTH_SECRET is too short (< 32 chars)", async () => {
    const { env } = await loadEnv({ AUTH_SECRET: "tooshort" });
    expect(() => env.AUTH_SECRET).toThrow();
  });

  it("throws when NEXT_PUBLIC_SITE_URL is missing", async () => {
    const { env } = await loadEnv({ NEXT_PUBLIC_SITE_URL: undefined });
    expect(() => env.NEXT_PUBLIC_SITE_URL).toThrow();
  });

  it("applies default STORAGE_ROOT when not set", async () => {
    const { env } = await loadEnv({ STORAGE_ROOT: undefined });
    expect(env.STORAGE_ROOT).toBe("./storage/uploads");
  });

  it("applies default NODE_ENV=development when not set", async () => {
    const { env } = await loadEnv({ NODE_ENV: undefined });
    expect(env.NODE_ENV).toBe("development");
  });

  it("optional SMTP_HOST is undefined when not set", async () => {
    const { env } = await loadEnv({ SMTP_HOST: undefined });
    expect(env.SMTP_HOST).toBeUndefined();
  });

  it("optional SEED_ADMIN_EMAIL is undefined when not set", async () => {
    const { env } = await loadEnv({ SEED_ADMIN_EMAIL: undefined });
    expect(env.SEED_ADMIN_EMAIL).toBeUndefined();
  });
});

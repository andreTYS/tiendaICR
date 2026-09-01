/**
 * Zod-validated environment variables — lazy.
 *
 * Why a Proxy: validation happens on first property access, not at import
 * time. During `next build` the collector imports every route; if this
 * module validated on import, builds without runtime secrets would fail.
 * Runtime code that reads `env.X` still gets the same validation error
 * on the first miss.
 *
 * Import this instead of accessing process.env directly.
 */
import { z } from "zod";

const schema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, { error: "DATABASE_URL is required" }),

  // Auth.js v5
  AUTH_SECRET: z
    .string()
    .min(32, { error: "AUTH_SECRET must be at least 32 characters" }),
  AUTH_URL: z.string().optional(),

  // Site
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .min(1, { error: "NEXT_PUBLIC_SITE_URL is required" }),
  PUBLIC_HOST: z.string().optional(),

  // Storage
  STORAGE_ROOT: z.string().default("./storage/uploads"),

  // Seed
  SEED_ADMIN_EMAIL: z.email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(12).optional(),

  // Contact / SMTP (all optional, feature-gated)
  CONTACT_EMAIL_ENABLED: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Runtime
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

function load(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`❌ Invalid environment variables:\n${formatted}`);
  }
  cached = parsed.data;
  return cached;
}

export const env = new Proxy({} as Env, {
  get(_target, prop, receiver) {
    return Reflect.get(load(), prop, receiver);
  },
  has(_target, prop) {
    return Reflect.has(load(), prop);
  },
  ownKeys() {
    return Reflect.ownKeys(load());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Reflect.getOwnPropertyDescriptor(load(), prop);
  },
});

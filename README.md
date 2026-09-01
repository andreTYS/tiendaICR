# Inversiones ICR — Web

Next.js 16 web platform and admin intranet for **Inversiones ICR** — a solar energy company operating across Peru. Built with Hexagonal/Screaming Architecture, Prisma v7, Auth.js v5, and Docker.

> **Full product spec**: see [`docs/PRD.md`](docs/PRD.md) for the feature catalog, module map, schema, deployment topology and operational notes.
>
> **Migrado desde el VPS anterior**: ver [`MIGRACION.md`](MIGRACION.md) — qué se importó, qué credenciales hay que rotar y cómo restaurar el volcado de la base de datos.

---

## Prerequisites

| Tool | Min version |
|------|-------------|
| Node.js | ≥ 22 (LTS) |
| Docker + Compose | any recent |
| npm | ≥ 10 |

> Production Docker images pin to `node:22-alpine` regardless of local Node version.

---

## Quick start (development)

```bash
# 1. Clone and enter the directory
git clone https://github.com/andreTYS/tiendaICR.git
cd tiendaICR

# 2. Start the dev database only (Postgres on host port 5433)
docker compose -f docker-compose.dev.yml up -d

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.local.example .env.local
# Values already match the dev compose above — no editing needed to get started.
# (`.env.example` is the *production* template and points at the `postgres`
#  compose hostname, not localhost:5433.)

# 5. Apply migrations
npm run db:migrate

# 6. Seed sample data
npm run seed

# 7. Start the dev server
npm run dev
# → http://localhost:3000
# → Admin: http://localhost:3000/admin
# → Login: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from .env.local
```

---

## Environment variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | — |
| `AUTH_SECRET` | ✅ | Random string ≥ 32 chars — `openssl rand -base64 32` | — |
| `AUTH_URL` | optional | Public base URL for Auth.js callbacks | auto-detected |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Canonical public URL (`https://example.com`) | — |
| `PUBLIC_HOST` | optional | Hostname for `next/image` remotePatterns | `localhost` |
| `STORAGE_ROOT` | optional | Upload directory on disk | `./storage/uploads` |
| `SEED_ADMIN_EMAIL` | seed only | Email for first admin user | — |
| `SEED_ADMIN_PASSWORD` | seed only | Password (≥ 12 chars) for first admin user | — |
| `CONTACT_EMAIL_ENABLED` | optional | Set `true` to enable SMTP email on contact form submission | `false` |
| `SMTP_HOST` | if email | SMTP server hostname | — |
| `SMTP_PORT` | if email | SMTP port (`587` or `465`) | `587` |
| `SMTP_USER` | if email | SMTP username / sender address | — |
| `SMTP_PASS` | if email | SMTP password | — |
| `SMTP_FROM` | if email | From address (defaults to `SMTP_USER`) | — |
| `NODE_ENV` | auto | `development` \| `test` \| `production` | `development` |

---

## Tests

```bash
npm test                  # all unit + integration tests (Vitest)
npm run test:watch        # watch mode
npm run test:coverage     # coverage report (85% threshold on domain/application)
npm run test:e2e          # Playwright E2E (requires running dev server on port 3000)
```

Unit tests live alongside source files (`*.test.ts` / `*.test.tsx`).  
E2E specs live in `e2e/`.

---

## Database scripts

```bash
npm run db:migrate        # prisma migrate dev (create + apply)
npm run db:deploy         # prisma migrate deploy (production / CI)
npm run db:studio         # open Prisma Studio
npm run seed              # idempotent seed: admin + settings + sample data
```

---

## Production deploy (VPS)

### First deploy

```bash
# 1. Copy and configure env
cp .env.example .env
# Edit .env: fill all required vars + CONTACT_EMAIL_ENABLED if needed

# 2. Build and start all services
docker compose up -d --build

# 3. First-time: run migrations + seed
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx scripts/seed.ts
```

### Updates

```bash
git pull
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

---

## Docker topology

```
Internet
    │
    ▼
 nginx:80/443          (nginx:1.27-alpine — reverse proxy, gzip, security headers)
    │
    ▼
  app:3000             (node:22-alpine — Next.js standalone, 3000 internal)
    │
    ▼
 postgres:5432         (postgres:16-alpine — data volume: pgdata)
```

Bind mounts:
- `./storage:/app/storage` — uploaded media survives rebuilds
- `./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro` — nginx config

---

## Storage

- Uploads land in `./storage/uploads/<yyyy>/<mm>/<cuid>.<ext>` (content-addressed).
- Served via `/api/media/[...key]` with `Cache-Control: public, max-age=31536000, immutable`.
- The `StorageProvider` port lives in `src/modules/media/domain/storage-provider.ts`.

### Backup strategy (recommended)

Run nightly on the VPS:

```bash
# Postgres dump
pg_dump "$DATABASE_URL" | gzip > /backups/icr-$(date +%F).sql.gz

# Sync uploads off-box
rsync -az ./storage/uploads user@backup-host:/backups/icr-uploads/
```

Keep 30 daily + 12 monthly snapshots.

### Migration path to S3/R2

1. Implement `S3StorageProvider` satisfying `StorageProvider` interface.
2. Swap the adapter at the composition root (`src/app/actions/banners.ts`, etc.).
3. Update `next.config.ts` `images.remotePatterns` to allow the S3 hostname.
4. No domain or application code changes required.

---

## Architecture overview

The codebase follows **Hexagonal (Ports & Adapters) + Screaming Architecture**:

```
src/
  modules/
    {module}/
      domain/          # Entities, value objects, repository ports, schemas — zero deps
      application/     # Use cases (depend on domain only, framework-free, TDD)
      infrastructure/  # Prisma adapters, bcrypt, nodemailer, storage
      presentation/    # React Server Components, client islands, Server Actions
  shared/
    lib/               # prisma singleton, env validation, result type, rate-limit, auth
    ui/                # Atomic Design: atoms → molecules → organisms → templates
  app/                 # Next.js App Router: pages, layouts, API routes
```

**Key invariant**: domain and application layers import NOTHING from Next.js, Prisma, or React. All dependencies flow inward through ports. This makes every use case unit-testable in < 1ms without a database.

---

## Rate limiting

Login attempts are throttled in-memory: **5 attempts / 60 seconds per IP**.  
Implementation: `src/shared/lib/rate-limit.ts` (token bucket, single-instance safe).

### Migration path to Redis

1. Install `@upstash/ratelimit` + `@upstash/redis`.
2. Replace the `checkRateLimit` call in `src/modules/auth/infrastructure/authjs-config.ts` with an Upstash adapter.
3. No other changes required.

---

## Contact form email (SMTP)

Set `CONTACT_EMAIL_ENABLED=true` and the `SMTP_*` vars to enable admin notifications on contact form submission. When disabled, messages are still persisted to the database — the admin can read them at `/admin/mensajes`.

---

## OG image

The default OG image is `public/og-default.svg`. For production, convert to PNG for maximum social-network compatibility:

```bash
# Using sharp-cli (install once globally)
npm install -g sharp-cli
sharp -i public/og-default.svg -o public/og-default.png resize 1200 630
```

Then update `src/app/layout.tsx` to reference `/og-default.png`.

---

## Health check

`GET /api/health` returns:

```json
{
  "status": "ok",
  "db": "up",
  "storage": "up",
  "version": "0.1.0",
  "timestamp": "2026-04-19T00:00:00.000Z"
}
```

HTTP 200 when healthy, 503 when DB is down. Used by Docker healthcheck and nginx/k8s probes.

---

## SDD artifacts (change history)

Architecture decisions and implementation notes are stored in Engram (persistent memory):

| Topic key | Contents |
|-----------|----------|
| `sdd/web-launch/proposal` | Original project proposal |
| `sdd/web-launch/spec` | Functional + non-functional requirements |
| `sdd/web-launch/design` | Technical design (Prisma schema, use-case signatures, ports) |
| `sdd/web-launch/tasks` | 5-phase task breakdown |
| `sdd/web-launch/apply-progress` | Implementation log per phase |

---

## Contributing

- **Conventional commits only** — no AI attribution in commit messages.
- `feat(scope): description` / `fix(scope): description` / `chore` / `docs` / `test`
- Run `npm test` before pushing — all 154+ tests must pass.
- Strict TDD on `modules/*/domain` and `modules/*/application` — tests before code.

---

## License

Private — all rights reserved.

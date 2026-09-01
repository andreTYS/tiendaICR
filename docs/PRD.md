# Inversiones ICR — Product Requirements Document

**Version**: 1.0
**Status**: Production-ready
**Last updated**: 2026-05-21
**Owner**: TukiTuki Solutions Devs

---

## 1. Product overview

Inversiones ICR is a Spanish/English bilingual marketing site **and** internal CMS for **Inversiones ICR S.A.C.**, an Arequipa-based solar energy installer operating across Peru. The platform serves three audiences:

| Audience | Surface | Purpose |
|---|---|---|
| Public visitors | `/`, `/servicios`, `/proyectos`, `/calculadora`, `/impacto`, `/contacto` (+ `/en` mirrors) | Brand, lead generation, project portfolio, ROI calculator |
| Authenticated admin/editor | `/admin/*` | Edit all content (banners, projects, categories, messages, social/contact info), configure Victron integration |
| Authenticated client (CLIENT role) | `/cliente/*` | Live energy dashboard for projects the client owns |

Built on **Next.js 16 (App Router) + Prisma 7 + PostgreSQL + Auth.js v5**, packaged as a single Docker image fronted by Caddy with automatic TLS.

---

## 2. Architecture

**Hexagonal (Ports & Adapters) + Screaming Architecture.**

```
src/modules/
  auth/            — login, sessions, role guards (ADMIN, EDITOR, CLIENT)
  banners/         — homepage hero rotation
  categories/      — project category taxonomy
  projects/        — portfolio entries with slug aliases, gallery, ordering
  contact/         — public contact form submissions
  media/           — local file storage adapter (mountable to S3/R2 later)
  settings/        — global site settings singleton (hero mode, etc.)
  site-contact/    — editable phone/email/social URLs singleton
  victron/         — VRM API integration: token + per-project live snapshots
  client-access/   — many-to-many CLIENT user ↔ project authorization

shared/
  lib/             — prisma singleton, env validation, result type, rate-limit, auth, crypto (HKDF)
  ui/              — Atomic Design (atoms → molecules → organisms → templates)
```

**Invariant**: `domain/` and `application/` import nothing from Next.js, Prisma, or React. All side-effect dependencies cross the boundary through repository ports. Use cases are unit-tested in <1 ms without a database. 153 tests pass on every build.

---

## 3. Feature catalog

### 3.1 Public site

- **i18n**: ES (default) + EN mirror. Locale derived from `usePathname()` — no global i18n provider, no route middleware overhead.
- **Hero**: 3 display modes (banners only, banners over animated SVG, animation only) — configurable from `/admin/settings`.
- **Projects**: filterable grid (`/proyectos`) → detail page (`/proyectos/[slug]`) with gallery, related projects, breadcrumbs. Old slugs redirect 301 via `ProjectSlugAlias`. Optional **live energy widget** when a Victron site is linked + public-metrics flag is on.
- **Calculator**: client-side ROI estimator for solar payback.
- **Contact form**: writes to `ContactMessage`; optional SMTP send when `CONTACT_EMAIL_ENABLED=true`. Rate-limited.
- **Footer**: tagline (i18n), 2 link columns (i18n), 1 contact column + social icons (dynamic, see §3.3.6).

### 3.2 Admin (`/admin/*`, ADMIN or EDITOR)

| Route | Purpose |
|---|---|
| `/admin` | Dashboard with counts + quick links |
| `/admin/banners` | List, reorder (dnd-kit), toggle active, edit, delete |
| `/admin/proyectos` | List, reorder, toggle active, edit, delete + Victron site linker per project |
| `/admin/proyectos/[id]/edit` | Full editor: text (ES/EN), main image, gallery, category, location, Victron site, client-access management |
| `/admin/categorias` | CRUD for project categories |
| `/admin/mensajes` | Inbox for contact-form submissions, mark read / delete |
| `/admin/contacto` | **Editable site contact + social URLs** (see §3.3.6) |
| `/admin/settings` | Hero display mode, max active banners, anim intensity, default locale (ADMIN only) |

### 3.3 Cross-cutting capabilities

#### 3.3.1 Auth & roles

- Credentials provider (Auth.js v5), JWT sessions (no DB session table).
- Roles: `ADMIN` (full access), `EDITOR` (content only — no `/admin/settings`), `CLIENT` (private dashboard at `/cliente` only).
- bcrypt password hashing (cost 12).
- Login rate limit: 5 attempts / 60 s per IP (in-memory; swap-in path to Upstash Redis documented).

#### 3.3.2 Media storage

- Files written to `STORAGE_ROOT` (default `./storage/uploads`). Served through `/api/media/[...key]`.
- Domain layer caps per-image upload at 5 MB; server-actions body limit raised to 10 MB.
- AVIF/WebP automatically negotiated by next/image.

#### 3.3.3 Victron VRM integration

- A single VRM API token (encrypted at rest via HKDF-SHA256 derived from `AUTH_SECRET`) is stored in the `VictronConfig` singleton row.
- Each project may link 1:1 with a VRM `idSite` via the `VictronSite` model.
- Snapshot cache: 120 s TTL, persisted in `VictronSite.lastSnapshot` so it survives restarts.
- Display flags per project: `showPv`, `showBattery`, `showLoad`, `showGrid`, `isPublicMetrics`.
- Endpoints: `/api/victron/public/[slug]/snapshot` (anyone, only if `isPublicMetrics=true`) · `/api/victron/client/[slug]/snapshot` (CLIENT user with `ClientAccess` row).

#### 3.3.4 CLIENT portal (`/cliente`)

- A `CLIENT` user logs in at `/cliente/login`.
- Lists projects they have `ClientAccess` rows for.
- Per-project page `/cliente/[slug]` renders the live energy widget regardless of `isPublicMetrics`.
- Access is created from `/admin/proyectos/[id]/edit` — admin mints a User with a one-shot displayed password.

#### 3.3.5 Slug-alias redirects

- Renaming a project moves its old slug to `ProjectSlugAlias`.
- Detail pages issue a `permanentRedirect` (HTTP 301) so old SEO/backlinks survive.

#### 3.3.6 Editable site contact + socials (new)

The `SiteContact` singleton (id=1) drives:

- **Footer "Contacto" column**: address (city + line), phone (`tel:`), WhatsApp (`wa.me/<digits>`), email (`mailto:`).
- **Footer brand column**: row of social icons (Instagram, Facebook, LinkedIn, TikTok, YouTube, X). Networks with empty URLs are hidden automatically.
- **Footer bottom-right**: free-form cities string (e.g. `"AREQUIPA · LIMA · CUSCO"`).
- **`/contacto` info column**: same 4 contact rows + social icons row beneath them.
- **Fallback**: if `SiteContact` is null or every relevant field is empty, the footer/contact page falls back to the i18n dictionary text so nothing breaks during migration.

Edited from `/admin/contacto` by ADMIN or EDITOR. Validation:
- Email format check
- All URLs must start with `http://` or `https://`
- Empty string = "not configured" (rendered as hidden)

Changes are applied instantly via `revalidatePath('/', 'layout')` + `revalidatePath('/en', 'layout')`. No deploy needed.

---

## 4. Database schema (production)

13 models — see `prisma/schema.prisma`:

`User`, `Banner`, `Category`, `Project`, `ProjectImage`, `ProjectSlugAlias`, `ContactMessage`, `Settings`, `VictronConfig`, `VictronSite`, `ClientAccess`, `SiteContact`.

Migrations are applied automatically on container start by `docker/entrypoint.sh` (`prisma migrate deploy` then `node server.js`).

---

## 5. Deployment

Single docker-compose stack:

```yaml
services:
  postgres:   # data persisted in named volume `pgdata`
  app:        # next.js standalone runner, port 3000 (internal)
  caddy:      # auto-TLS Let's Encrypt for ${PUBLIC_HOST} + www
```

### First deploy

```bash
ssh root@vps
cd /srv/inversiones-icr
git clone https://github.com/TukiTukiSolutionsDevs/InversionesICR.git .
cp .env.example .env && vim .env   # fill real values + generate AUTH_SECRET
docker compose up -d --build
# DNS A record for PUBLIC_HOST → VPS IP must already exist (Caddy needs port 80 to provision certs)
docker compose exec app npm run seed   # one-shot: create admin + sample content + site contact defaults
```

### Updates

```bash
git pull
docker compose up -d --build
# migrations run automatically on app start via entrypoint.sh
```

### Required env vars

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://icr:STRONG_PASSWORD@postgres:5432/icr` |
| `AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://inversionesicr.com` |
| `PUBLIC_HOST` | ✅ | hostname for Caddy + next/image |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | ✅ | must match `DATABASE_URL` |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | seed only | first admin user |
| `CONTACT_EMAIL_ENABLED` + SMTP vars | optional | enables contact-form email notifications |

---

## 6. Operational notes

- **Storage backups**: `/srv/inversiones-icr/storage` (host-mounted) holds all uploaded images. Back up with `rsync` daily. Migration to S3/R2 is a one-file swap of `src/modules/media/infrastructure/`.
- **DB backups**: `docker compose exec postgres pg_dump -U icr icr | gzip > backup.sql.gz`
- **Health check**: `GET /api/health` returns 200 if Prisma can reach the DB.
- **Logs**: `docker compose logs -f app caddy`
- **TLS**: Caddy auto-provisions and auto-renews. Certificate state persists in the named volume `caddy_data`.
- **Rate limiting** is in-memory — multi-replica deployments must migrate to Redis first.

---

## 7. Quality bars

- ✅ Domain + application: 85% coverage threshold (vitest)
- ✅ 153 tests passing
- ✅ `npm run build` succeeds with TypeScript strict mode
- ✅ Lighthouse: dark theme, AVIF images, no CLS on hero rotation
- ✅ Auth: bcrypt hashing, JWT sessions, role-guarded server actions, login rate limiting
- ✅ Crypto: VRM token encrypted at rest with HKDF-derived key (rotates with `AUTH_SECRET`)
- ✅ Persistent uploads survive container restarts (host-mounted volume)

---

## 8. Known limitations / roadmap hints

- Rate limiter is single-instance only.
- Local-disk media adapter — not multi-replica ready until S3/R2 swap.
- Search not yet exposed in the public projects page (categories filter only).
- No analytics integration (Plausible/Umami) wired up yet.

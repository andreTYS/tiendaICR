/**
 * Seed script — idempotent, safe to run multiple times.
 *
 * Usage: npm run seed
 * Requires: DATABASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD in .env.local
 *
 * Static imports are hoisted BEFORE any executable code, so dotenv.config()
 * must run first. We achieve this by using dynamic import() inside main(),
 * which defers module evaluation until after dotenv has populated process.env.
 */
import { config } from "dotenv";
import { resolve } from "path";

// Must run BEFORE any dynamic import that reads process.env
config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  // Dynamic imports — evaluated after dotenv.config() above
  const { seedAdmin } = await import(
    "../src/modules/auth/application/seed-admin"
  );
  const { prismaUserRepository } = await import(
    "../src/modules/auth/infrastructure/prisma-user-repository"
  );
  const { bcryptPasswordHasher } = await import(
    "../src/modules/auth/infrastructure/bcrypt-password-hasher"
  );
  const { prisma } = await import("../src/shared/lib/prisma");
  const { generatePlaceholders } = await import("./generate-placeholders");

  // ── Sample images (dev only) ─────────────────────────────────────────────
  // Make the seed idempotent end-to-end: regenerate any missing sample JPGs
  // so the admin UI and public site aren't broken after a storage wipe.
  if (process.env.NODE_ENV !== "production") {
    const r = await generatePlaceholders();
    if (r.created.length) {
      console.log(`📸 Placeholders: generated ${r.created.length} files.`);
    } else {
      console.log(`📸 Placeholders: all ${r.skipped.length} files already on disk.`);
    }
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env.local"
    );
    process.exit(1);
  }

  // ── Admin user ──────────────────────────────────────────────────────────────
  console.log(`🌱 Seeding admin user: ${email}`);

  const result = await seedAdmin(
    { email, password },
    { users: prismaUserRepository, hasher: bcryptPasswordHasher }
  );

  if (!result.ok) {
    if (result.error === "ALREADY_SEEDED") {
      console.log("⚠️  Admin already exists — skipping seed.");
    } else {
      console.error(`❌ Seed failed: ${result.error}`);
      process.exit(1);
    }
  } else {
    console.log(`✅ Admin created with id: ${result.value.id}`);
  }

  // ── Settings (always upsert, idempotent) ────────────────────────────────────
  console.log("🌱 Seeding default settings…");
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      heroDisplayMode: "ANIMATION_ONLY",
      animIntensity: 1.6,
      defaultLocale: "es",
    },
  });
  console.log("✅ Settings ready.");

  // ── Site contact (editable from /admin/contacto, ported from i18n defaults) ─
  // Idempotent: only populate defaults when the row is missing or still empty
  // (preserves any edits the admin has made via /admin/contacto).
  console.log("🌱 Seeding default site contact…");
  const defaults = {
    phone: "+51 954 112 488",
    whatsapp: "+51 987 334 209",
    email: "proyectos@inversionesicr.com",
    addressLine: "Av. Ejército 789, Cayma",
    addressCity: "Arequipa",
    cities: "AREQUIPA · LIMA · CUSCO",
  };
  const existing = await prisma.siteContact.findUnique({ where: { id: 1 } });
  if (!existing) {
    await prisma.siteContact.create({ data: { id: 1, ...defaults } });
    console.log("✅ Site contact created with defaults.");
  } else if (!existing.phone && !existing.email) {
    await prisma.siteContact.update({ where: { id: 1 }, data: defaults });
    console.log("✅ Site contact populated (row was empty).");
  } else {
    console.log("⚠️  Site contact already configured — skipping.");
  }

  // ── Non-production sample data ───────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    // ── Banners ──────────────────────────────────────────────────────────────
    const bannerCount = await prisma.banner.count();
    if (bannerCount === 0) {
      console.log("🌱 Seeding sample banners…");
      const now = new Date();
      await prisma.banner.createMany({
        data: [
          {
            titleEs: "Bienvenido a ICR",
            titleEn: "Welcome to ICR",
            descEs: "Inversiones que transforman tu futuro",
            descEn: "Investments that transform your future",
            imageKey: "sample/banner-01.jpg",
            ctaLabelEs: "Conoce más",
            ctaLabelEn: "Learn more",
            ctaHref: "/proyectos",
            isActive: true,
            order: 0,
            createdAt: now,
            updatedAt: now,
          },
          {
            titleEs: "Portafolio diversificado",
            titleEn: "Diversified portfolio",
            descEs: "Proyectos en múltiples sectores estratégicos",
            descEn: "Projects across multiple strategic sectors",
            imageKey: "sample/banner-02.jpg",
            ctaLabelEs: null,
            ctaLabelEn: null,
            ctaHref: null,
            isActive: false,
            order: 1,
            createdAt: now,
            updatedAt: now,
          },
          {
            titleEs: "Asesoría personalizada",
            titleEn: "Personalized advisory",
            descEs: "Expertos a tu disposición",
            descEn: "Experts at your service",
            imageKey: "sample/banner-03.jpg",
            ctaLabelEs: "Contáctanos",
            ctaLabelEn: "Contact us",
            ctaHref: "/contacto",
            isActive: false,
            order: 2,
            createdAt: now,
            updatedAt: now,
          },
        ],
      });
      console.log("✅ Sample banners created (1 active, 2 inactive).");
    } else {
      console.log(
        `⚠️  Banners already exist (${bannerCount}) — skipping banner seed.`
      );
    }

    // ── Categories ───────────────────────────────────────────────────────────
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      console.log("🌱 Seeding sample categories…");
      await prisma.category.createMany({
        data: [
          { slug: "mineria", nameEs: "Minería", nameEn: "Mining" },
          {
            slug: "infraestructura",
            nameEs: "Infraestructura",
            nameEn: "Infrastructure",
          },
          {
            slug: "energia",
            nameEs: "Energía",
            nameEn: "Energy",
          },
          {
            slug: "tecnologia",
            nameEs: "Tecnología",
            nameEn: "Technology",
          },
          {
            slug: "bienes-raices",
            nameEs: "Bienes Raíces",
            nameEn: "Real Estate",
          },
        ],
      });
      console.log("✅ Sample categories created.");
    } else {
      console.log(
        `⚠️  Categories already exist (${categoryCount}) — skipping category seed.`
      );
    }

    // ── Projects ─────────────────────────────────────────────────────────────
    const projectCount = await prisma.project.count();
    if (projectCount === 0) {
      console.log("🌱 Seeding sample projects…");

      // Re-fetch categories to get their generated IDs
      const categories = await prisma.category.findMany();
      const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

      const now = new Date();
      await prisma.project.createMany({
        data: [
          {
            slug: "proyecto-aureo",
            titleEs: "Proyecto Áureo",
            titleEn: "Aureo Project",
            descEs:
              "Extracción responsable de oro en la región central con tecnología de punta y mínimo impacto ambiental.",
            descEn:
              "Responsible gold extraction in the central region using cutting-edge technology and minimal environmental impact.",
            location: "Región Central",
            categoryId: bySlug["mineria"]!,
            mainImageKey: "sample/project-aureo.jpg",
            order: 0,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            slug: "carretera-norte",
            titleEs: "Carretera Norte",
            titleEn: "Northern Highway",
            descEs:
              "Ampliación y modernización del corredor vial norte, conectando comunidades remotas con los centros económicos.",
            descEn:
              "Expansion and modernization of the northern road corridor, connecting remote communities to economic centers.",
            location: "Zona Norte",
            categoryId: bySlug["infraestructura"]!,
            mainImageKey: "sample/project-carretera.jpg",
            order: 1,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            slug: "parque-solar-ica",
            titleEs: "Parque Solar ICA",
            titleEn: "ICA Solar Park",
            descEs:
              "Planta fotovoltaica de 50 MW capaz de abastecer a más de 30 000 hogares con energía limpia y renovable.",
            descEn:
              "50 MW photovoltaic plant capable of supplying over 30,000 homes with clean, renewable energy.",
            location: "Ica, Perú",
            categoryId: bySlug["energia"]!,
            mainImageKey: "sample/project-solar.jpg",
            order: 2,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            slug: "hub-tecnologico-lima",
            titleEs: "Hub Tecnológico Lima",
            titleEn: "Lima Tech Hub",
            descEs:
              "Centro de innovación y aceleración de startups en el corazón financiero de Lima.",
            descEn:
              "Innovation and startup acceleration center in the financial heart of Lima.",
            location: "Lima",
            categoryId: bySlug["tecnologia"]!,
            mainImageKey: "sample/project-hub.jpg",
            order: 3,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            slug: "residencias-del-pacifico",
            titleEs: "Residencias del Pacífico",
            titleEn: "Pacific Residences",
            descEs:
              "Complejo residencial de lujo frente al mar con 120 unidades y amenidades de primer nivel.",
            descEn:
              "Luxury beachfront residential complex with 120 units and top-tier amenities.",
            location: "Miraflores, Lima",
            categoryId: bySlug["bienes-raices"]!,
            mainImageKey: "sample/project-residencias.jpg",
            order: 4,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
          {
            slug: "planta-hidro-andes",
            titleEs: "Planta Hidro Andes",
            titleEn: "Andes Hydro Plant",
            descEs:
              "Pequeña central hidroeléctrica de pasada que aprovecha el caudal natural de los ríos andinos sin alterar su ecosistema.",
            descEn:
              "Small run-of-river hydroelectric plant harnessing the natural flow of Andean rivers without altering their ecosystem.",
            location: "Sierra Central",
            categoryId: bySlug["energia"]!,
            mainImageKey: "sample/project-hidro.jpg",
            order: 5,
            isActive: false,
            createdAt: now,
            updatedAt: now,
          },
        ],
      });
      console.log("✅ Sample projects created.");

      // ── Gallery images for every project ────────────────────────────────
      // Each project gets 2 additional ProjectImage rows pointing to the
      // main image of DIFFERENT sample projects — gives the detail-page
      // gallery something non-empty to render until the admin uploads the
      // real photos.
      const gallerySources = [
        "sample/project-aureo.jpg",
        "sample/project-carretera.jpg",
        "sample/project-solar.jpg",
        "sample/project-hub.jpg",
        "sample/project-residencias.jpg",
        "sample/project-hidro.jpg",
      ];
      const allProjects = await prisma.project.findMany({
        select: { id: true, mainImageKey: true, titleEs: true },
      });
      const galleryRows = allProjects.flatMap((p) => {
        // Pick two placeholders that are NOT the project's own main image.
        const others = gallerySources.filter((s) => s !== p.mainImageKey);
        return [
          {
            projectId: p.id,
            imageKey: others[0]!,
            alt: `${p.titleEs} — galería 1`,
            order: 0,
          },
          {
            projectId: p.id,
            imageKey: others[1]!,
            alt: `${p.titleEs} — galería 2`,
            order: 1,
          },
        ];
      });
      await prisma.projectImage.createMany({ data: galleryRows });
      console.log(
        `✅ Gallery images created (${galleryRows.length} for ${allProjects.length} projects).`
      );
    } else {
      console.log(
        `⚠️  Projects already exist (${projectCount}) — skipping project seed.`
      );
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

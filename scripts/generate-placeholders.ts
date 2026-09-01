/**
 * Dev-only: generate sample placeholder JPGs referenced by the seed.
 * Uses `sharp` (bundled with Next.js). Produces 1600×900 images with
 * a themed gradient + title text per project/banner.
 *
 * Can be run standalone:
 *   npx tsx scripts/generate-placeholders.ts
 *
 * Or imported from the seed (seed.ts calls generatePlaceholders() so a
 * fresh `npm run db:seed` always has on-disk images matching the rows).
 *
 * Output: storage/uploads/sample/*.jpg
 */
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

export type Placeholder = {
  file: string;
  title: string;
  subtitle: string;
  from: string; // gradient start
  to: string;   // gradient end
};

export const PLACEHOLDERS: Placeholder[] = [
  // Banners
  { file: "banner-01.jpg", title: "Bienvenido a ICR", subtitle: "Inversiones con impacto",  from: "#F7C948", to: "#D35400" },
  { file: "banner-02.jpg", title: "Portafolio diverso", subtitle: "Sectores estratégicos", from: "#1B4F72", to: "#154360" },
  { file: "banner-03.jpg", title: "Asesoría experta", subtitle: "Contáctanos hoy",         from: "#117A65", to: "#0B5345" },
  // Projects
  { file: "project-aureo.jpg",       title: "Proyecto Áureo",         subtitle: "Minería — Región Central",   from: "#D4AF37", to: "#7E5109" },
  { file: "project-carretera.jpg",   title: "Carretera Norte",        subtitle: "Infraestructura — Zona Norte", from: "#566573", to: "#1C2833" },
  { file: "project-solar.jpg",       title: "Parque Solar ICA",       subtitle: "Energía — Ica",               from: "#F39C12", to: "#1F618D" },
  { file: "project-hub.jpg",         title: "Hub Tecnológico Lima",   subtitle: "Tecnología — Lima",           from: "#8E44AD", to: "#1ABC9C" },
  { file: "project-residencias.jpg", title: "Residencias Pacífico",   subtitle: "Bienes Raíces — Miraflores",  from: "#17A589", to: "#0E6251" },
  { file: "project-hidro.jpg",       title: "Planta Hidro Andes",     subtitle: "Energía — Sierra Central",    from: "#2874A6", to: "#1B4F72" },
];

const WIDTH = 1600;
const HEIGHT = 900;

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function svgFor({ title, subtitle, from, to }: Placeholder): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/>
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect width="100%" height="100%" filter="url(#noise)"/>
    <g font-family="'Space Grotesk','Inter',system-ui,sans-serif" fill="#ffffff">
      <text x="80" y="${HEIGHT - 180}" font-size="84" font-weight="700" letter-spacing="-2">${escapeXml(title)}</text>
      <text x="84" y="${HEIGHT - 110}" font-size="30" font-weight="400" opacity="0.85">${escapeXml(subtitle)}</text>
      <rect x="80" y="${HEIGHT - 80}" width="120" height="4" fill="#ffffff" opacity="0.6"/>
    </g>
    <g font-family="'Space Grotesk',sans-serif" fill="#ffffff" opacity="0.4">
      <text x="${WIDTH - 200}" y="90" font-size="22" font-weight="700" letter-spacing="4">ICR · SAMPLE</text>
    </g>
  </svg>`;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure every placeholder file exists on disk.
 * @param outDir  Absolute path to write into. Defaults to `<cwd>/storage/uploads/sample`.
 * @param force   If true, overwrite existing files. Default false (idempotent).
 * @returns       { created, skipped } counts.
 */
export async function generatePlaceholders(
  outDir: string = join(process.cwd(), "storage", "uploads", "sample"),
  force = false,
): Promise<{ created: string[]; skipped: string[] }> {
  await mkdir(outDir, { recursive: true });

  const created: string[] = [];
  const skipped: string[] = [];

  for (const p of PLACEHOLDERS) {
    const outPath = join(outDir, p.file);
    if (!force && (await fileExists(outPath))) {
      skipped.push(p.file);
      continue;
    }
    const svg = svgFor(p);
    const jpg = await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer();
    await writeFile(outPath, jpg);
    created.push(p.file);
  }

  return { created, skipped };
}

// CLI entrypoint — runs only when invoked directly (not when imported).
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePlaceholders(undefined, true)
    .then((r) => {
      r.created.forEach((f) => console.log(`✅ ${f}`));
      console.log(`\nGenerated ${r.created.length} placeholders (${r.skipped.length} skipped)`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

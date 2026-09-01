/**
 * Public snapshot endpoint for the live-energy widget on /proyectos/[slug].
 *
 * Access: anyone — but ONLY if the linked VictronSite has `isPublicMetrics`
 * enabled. Returns 404 otherwise (same shape as "no widget configured" so
 * callers don't need to special-case it).
 *
 * Caching: the underlying `getPublicSnapshot` already TTL-caches at the DB
 * level (120 s). We additionally tell HTTP caches/CDNs to keep the response
 * for 30 s so multiple visitors don't trigger DB lookups on every render.
 */
import { NextResponse } from "next/server";
import { prismaProjectRepository } from "@/modules/projects/infrastructure/prisma-project-repository";
import { prismaVictronSiteRepository } from "@/modules/victron/infrastructure/prisma-victron-site-repository";
import { prismaVictronConfigRepository } from "@/modules/victron/infrastructure/prisma-victron-config-repository";
import { vrmApiClient } from "@/modules/victron/infrastructure/vrm-api-client";
import { getPublicSnapshot } from "@/modules/victron/application/get-snapshot";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const project = await prismaProjectRepository.findBySlug(slug);
  if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const result = await getPublicSnapshot(
    { projectId: project.id },
    {
      siteRepo: prismaVictronSiteRepository,
      configRepo: prismaVictronConfigRepository,
      vrm: vrmApiClient,
    },
  );

  if (!result.ok) {
    const status = result.error === "UNAUTHORIZED" ? 404 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }

  const site = await prismaVictronSiteRepository.findByProjectId(project.id);

  return NextResponse.json(
    {
      snapshot: result.value.snapshot,
      fresh: result.value.fresh,
      fetchedAt: result.value.fetchedAt,
      visibility: site
        ? {
            showPv: site.showPv,
            showBattery: site.showBattery,
            showLoad: site.showLoad,
            showGrid: site.showGrid,
          }
        : null,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
      },
    },
  );
}

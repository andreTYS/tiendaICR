/**
 * Authenticated snapshot endpoint for the client portal at /cliente/[slug].
 *
 * Access: ADMIN/EDITOR see everything; CLIENT users only see projects they
 * have an explicit ClientAccess row for. Returns 401 if signed out, 403 if
 * signed in but unauthorised.
 */
import { NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import type { Role } from "@/modules/auth/domain/user-role";

import { prismaProjectRepository } from "@/modules/projects/infrastructure/prisma-project-repository";
import { prismaVictronSiteRepository } from "@/modules/victron/infrastructure/prisma-victron-site-repository";
import { prismaVictronConfigRepository } from "@/modules/victron/infrastructure/prisma-victron-config-repository";
import { vrmApiClient } from "@/modules/victron/infrastructure/vrm-api-client";
import { getProtectedSnapshot } from "@/modules/victron/application/get-snapshot";
import { prismaClientAccessRepository } from "@/modules/client-access/infrastructure/prisma-client-access-repository";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const role = session.user.role as Role;
  const userId = (session.user as { id: string }).id;

  const { slug } = await ctx.params;
  const project = await prismaProjectRepository.findBySlug(slug);
  if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // ADMIN/EDITOR can read any. CLIENT needs an explicit access row.
  if (role === "CLIENT") {
    const allowed = await prismaClientAccessRepository.has(userId, project.id);
    if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const result = await getProtectedSnapshot(
    { projectId: project.id },
    {
      siteRepo: prismaVictronSiteRepository,
      configRepo: prismaVictronConfigRepository,
      vrm: vrmApiClient,
    },
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
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
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

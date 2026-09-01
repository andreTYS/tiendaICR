/**
 * Home page RSC smoke tests.
 * The pages are async RSCs that import Prisma repos — we mock all infrastructure
 * so no DATABASE_URL is required in the test environment.
 */
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mock infrastructure ────────────────────────────────────────────────────────

vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/modules/banners/infrastructure/prisma-banner-repository", () => ({
  prismaBannerRepository: {
    findActive: vi.fn().mockResolvedValue([]),
    listActive: vi.fn().mockResolvedValue([]),
    listAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countActive: vi.fn().mockResolvedValue(0),
    reorder: vi.fn(),
  },
}));

vi.mock("@/modules/settings/infrastructure/prisma-settings-repository", () => ({
  prismaSettingsRepository: {
    get: vi.fn().mockResolvedValue({
      heroDisplayMode: "animation-only",
      heroCycleSec: 6,
      animIntensity: 1.6,
      locale: "es",
    }),
    update: vi.fn(),
  },
}));

// Mock HeroBanners (client component with autoplay logic)
vi.mock("@/shared/ui/organisms/hero-banners", () => ({
  default: () => <div data-testid="hero-banners" />,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Home page (async RSC)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ES: renders without crashing and shows H1", async () => {
    const { default: HomePage } = await import("./page");
    const jsx = await HomePage();
    render(jsx as React.ReactElement);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("EN: renders without crashing and shows H1", async () => {
    const { default: HomeEnPage } = await import("./en/page");
    const jsx = await HomeEnPage();
    render(jsx as React.ReactElement);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Server Actions accept up to 10 MB per request. Default is 1 MB, which
  // rejected banner/project image uploads > 1 MB with a 400 / connection reset.
  // Domain layer caps individual images at 5 MB (see media-schemas.ts); 10 MB
  // here leaves room for form fields + a project with a main image + a few
  // gallery images in one submit.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    // AVIF first (best compression), WebP fallback — supported by next/image optimizer
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/api/media/**",
      },
      {
        protocol: "https",
        hostname: process.env.PUBLIC_HOST ?? "localhost",
        pathname: "/api/media/**",
      },
    ],
  },
};

export default nextConfig;

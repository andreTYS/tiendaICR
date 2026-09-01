import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    // Ancla la raíz del workspace a este directorio. Sin esto, Turbopack la
    // infiere buscando lockfiles hacia arriba, y un package-lock.json suelto en
    // el directorio del usuario (habitual tras un `npm install` accidental en
    // ~) se la lleva fuera del proyecto. Además de ensuciar el arranque con un
    // aviso, eso desplaza el trazado de ficheros de `output: "standalone"`, que
    // es lo que copia la imagen Docker.
    root: import.meta.dirname,
  },
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

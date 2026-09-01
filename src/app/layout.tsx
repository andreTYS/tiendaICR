import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Inversiones ICR — Energía solar en Perú",
    template: "%s | Inversiones ICR",
  },
  description:
    "Diseñamos, instalamos y monitoreamos sistemas solares de alta eficiencia para hogares, empresas, industrias y minas en Perú.",
  openGraph: {
    siteName: "Inversiones ICR",
    type: "website",
    locale: "es_PE",
    // og-default.svg is the source; for production convert to PNG:
    // npx sharp-cli -i public/og-default.svg -o public/og-default.png resize 1200 630
    images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  // `icons` is intentionally omitted: Next.js 16 auto-detects
  // app/icon.png + app/apple-icon.png and injects the right <link> tags.
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      // Phase 2: hardcoded anim intensity — Phase 3 wires from Settings
      style={{ "--anim-scale": "1.6" } as React.CSSProperties}
      // Tells Next.js to disable smooth scrolling during client-side
      // route transitions (prevents jank + silences the dev warning).
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}

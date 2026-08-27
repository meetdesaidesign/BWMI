import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { assetPath } from "@/lib/assets";

const title = "Fixo";
const description = "Report it. Track it. Confirm the fix. Report local problems to the right authority, follow every update, and verify the work before an issue is closed.";
const siteUrl = process.env.GITHUB_PAGES === "true"
  ? "https://meetdesaidesign.github.io/BWMI"
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Fixo",
  manifest: assetPath("/manifest.webmanifest"),
  icons: {
    icon: [
      {
        url: assetPath("/brand/favicon-light.svg"),
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: assetPath("/brand/favicon-dark.svg"),
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },

  appleWebApp: {
    capable: true,
    title: "Fixo",
  },
  openGraph: {
    title,
    description,
    siteName: "Fixo",
    locale: "en_IN",
    type: "website",
    images: [{ url: assetPath("/brand/icon-512.png"), width: 512, height: 512, alt: "Fixo" }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: [assetPath("/brand/icon-512.png")],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7313F5",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

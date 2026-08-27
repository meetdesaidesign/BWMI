import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { assetPath } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Pakka — Jayanagar",
  description: "Report a public issue, track it, and confirm the fix.",
  manifest: assetPath("/manifest.webmanifest"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1747D1",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

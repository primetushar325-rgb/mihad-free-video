// PWA manifest (manifest.webmanifest)
import type { MetadataRoute } from "next";
import { getSettingsSafe } from "@/lib/safe";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettingsSafe();
  const name = settings.websiteName || "Mihad Free Video";
  const maskable = settings.logoUrl || undefined;

  return {
    name,
    short_name: name.length > 12 ? "Mihad Video" : name,
    description: "Browse and download free premium videos.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050505",
    theme_color: settings.primaryColor || "#0a0a0a",
    categories: ["entertainment", "video", "lifestyle"],
    icons: maskable
      ? [
          { src: maskable, sizes: "192x192", type: "image/png", purpose: "any" },
          { src: maskable, sizes: "512x512", type: "image/png", purpose: "any" },
          { src: maskable, sizes: "512x512", type: "image/png", purpose: "maskable" },
        ]
      : [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
  };
}

import type { MetadataRoute } from "next";
import { getSettingsSafe } from "@/lib/safe";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettingsSafe();
  const name = settings.websiteName || "Mihad Free Video";
  return {
    id: "/",
    name,
    short_name: name.length > 12 ? "Mihad Video" : name,
    description: "Browse and download free premium videos, with giveaways and offline app access.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#050505",
    theme_color: settings.primaryColor || "#f5a623",
    lang: "bn-BD",
    dir: "ltr",
    categories: ["entertainment", "video", "lifestyle"],
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Browse Videos", short_name: "Videos", url: "/", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Search Videos", short_name: "Search", url: "/search", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}

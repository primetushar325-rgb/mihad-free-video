// Dynamic sitemap.xml
import type { MetadataRoute } from "next";
import { getCategoriesSafe, getVideosSafe } from "@/lib/safe";
import { siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/trending`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/apps`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/youtube`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/news`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];

  try {
    const [categories, videos] = await Promise.all([
      getCategoriesSafe(),
      getVideosSafe({ limit: 1000 }),
    ]);

    const catEntries: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${base}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const videoEntries: MetadataRoute.Sitemap = videos.map((v) => ({
      url: `${base}/video/${v.id}`,
      lastModified: new Date(v.updatedAt || v.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...catEntries, ...videoEntries];
  } catch {
    return staticEntries;
  }
}

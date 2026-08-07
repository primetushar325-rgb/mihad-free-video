// ============================================================
// Safe data access for server components.
// Returns sensible defaults if the database is unreachable so the
// public site still renders (graceful degradation). Real data is
// returned once Cloudflare D1 is configured.
// ============================================================

import { isDbConfigured } from "@/lib/db";
import * as repo from "@/lib/repository";
import type {
  Settings,
  Category,
  Slide,
  VideoWithCategory,
  DashboardStats,
} from "@/types";

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  websiteName: "Mihad Free Video",
  logoUrl: "",
  faviconUrl: "",
  footerText: "© Mihad Free Video. All rights reserved.",
  primaryColor: "#f5a623",
  secondaryColor: "#0a0a0a",
  enablePwa: true,
  enableAds: true,
  adsenseHeader: "",
  adsenseBetweenCards: "",
  adsenseDetails: "",
  adsenseFooter: "",
  adsenseClient: "",
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.warn("[safe-data] falling back to defaults:", (err as Error).message);
    return fallback;
  }
}

export function getSettingsSafe(): Promise<Settings> {
  return safe(() => repo.getSettings(), DEFAULT_SETTINGS);
}

export function getCategoriesSafe(): Promise<Category[]> {
  return safe(() => repo.listCategories(), []);
}

export function getSlidesSafe(): Promise<Slide[]> {
  return safe(() => repo.listSlides({ onlyActive: true }), []);
}

export function getVideosSafe(opts?: {
  categoryId?: number;
  featured?: boolean;
  limit?: number;
  offset?: number;
}): Promise<VideoWithCategory[]> {
  return safe(() => repo.listVideos(opts), []);
}

export function searchVideosSafe(
  term: string,
  opts?: { categoryId?: number; featured?: boolean; limit?: number }
): Promise<VideoWithCategory[]> {
  return safe(() => repo.searchVideos(term, opts), []);
}

export function getVideoByIdSafe(
  id: number
): Promise<VideoWithCategory | null> {
  return safe(() => repo.getVideoById(id), null);
}

export function getRelatedSafe(
  video: { id: number; categoryId: number | null },
  limit = 8
): Promise<VideoWithCategory[]> {
  return safe(
    () =>
      repo.getRelatedVideos(
        { id: video.id, categoryId: video.categoryId } as never,
        limit
      ),
    []
  );
}

export function getDashboardSafe(): Promise<DashboardStats | null> {
  if (!isDbConfigured()) return Promise.resolve(null);
  return safe(() => repo.getDashboardStats(), null);
}

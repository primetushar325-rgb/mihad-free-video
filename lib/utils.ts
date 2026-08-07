// ============================================================
// Shared UI/utility helpers (pure functions, no server deps).
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Conditional className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Relative time like "3 hours ago". */
export function timeAgo(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const intervals: [number, string][] = [
    [60, "minute"],
    [3600, "hour"],
    [86400, "day"],
    [604800, "week"],
    [2629800, "month"],
    [31557600, "year"],
  ];
  let value = seconds;
  let unit = "second";
  for (let i = 0; i < intervals.length; i++) {
    const [secs, name] = intervals[i];
    if (seconds < (intervals[i + 1]?.[0] ?? Infinity)) {
      value = Math.floor(seconds / secs);
      unit = name;
      break;
    }
  }
  if (seconds < 60) {
    value = seconds;
    unit = "second";
  }
  const label = value === 1 ? unit : `${unit}s`;
  return `${value} ${label} ago`;
}

/** Human-readable absolute date. */
export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Convert a comma string into a clean tag array. */
export function parseTags(tags: string | string[] | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean);
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Site URL helper (no trailing slash). */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export function siteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME || "Mihad Free Video";
}

/** URL-friendly slug from any string. */
export function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non alphanumerics
    .replace(/\s+/g, "-") // spaces -> dashes
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^-|-$/g, ""); // trim dashes
}

"use client";

// ============================================================
// visitor.ts — a stable per-browser visitor id stored in
// localStorage, used to count unique visitors in analytics.
// ============================================================

const KEY = "mhv_visitor_id";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return (
    "v-" +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36)
  );
}

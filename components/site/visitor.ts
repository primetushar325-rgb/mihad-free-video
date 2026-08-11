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

/**
 * Fire-and-forget download event to /api/track/download.
 * Uses navigator.sendBeacon when available (most reliable — the
 * request is guaranteed to reach the server even as a tab closes
 * or the page navigates). Falls back to fetch with keepalive.
 */
export function sendDownloadEvent(videoId: number, videoTitle: string): void {
  const payload = JSON.stringify({
    visitorId: getVisitorId(),
    videoId,
    videoTitle: videoTitle || "",
  });

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/track/download", blob)) return;
    }
  } catch {
    /* fall through to fetch */
  }

  try {
    fetch("/api/track/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

"use client";

// ============================================================
// VisitTracker — records a page visit on mount (once per session
// per page via a session flag). Sends visitor id + page path to
// the public /api/track/visit endpoint. Fails silently if the
// DB is unavailable so it never breaks the page.
// ============================================================

import { useEffect } from "react";
import { getVisitorId } from "./visitor";

const KEY = "mhv_tracked_paths";

export default function VisitTracker() {
  useEffect(() => {
    try {
      const path = window.location.pathname + window.location.search;
      let tracked: Record<string, number> = {};
      try {
        tracked = JSON.parse(sessionStorage.getItem(KEY) || "{}");
      } catch {
        tracked = {};
      }
      const now = Date.now();
      const last = tracked[path] || 0;
      // Avoid hammering on rapid back/forward; min 5s between the same path.
      if (now - last < 5000) return;
      tracked[path] = now;
      try {
        sessionStorage.setItem(KEY, JSON.stringify(tracked));
      } catch {
        /* ignore */
      }

      const payload = {
        visitorId: getVisitorId(),
        pagePath: path,
        referrer: document.referrer || "",
      };

      fetch("/api/track/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* never block rendering */
    }
  }, []);

  return null;
}

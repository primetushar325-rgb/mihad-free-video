"use client";

// ============================================================
// AdScripts — injects the network ad script tags ONLY on public
// pages. Uses usePathname() so it NEVER loads on /admin (or any
// future route under /admin). Injects each ad script once per
// page load.
// ============================================================

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AdScripts() {
  const pathname = usePathname();
  const injected = useRef(false);

  useEffect(() => {
    // Never load ad scripts anywhere under /admin.
    if (pathname.startsWith("/admin")) return;

    // Inject each ad script only once per page load.
    if (injected.current) return;
    injected.current = true;

    const root = document.documentElement;
    const head = document.head;

    // Ad #2 — 5gvci tag
    const s2 = document.createElement("script");
    s2.src = "https://5gvci.com/act/files/tag.min.js?z=11550589";
    s2.async = true;
    s2.setAttribute("data-cfasync", "false");
    head.appendChild(s2);

    // Ad #3 — n6wxm vignette
    const s3 = document.createElement("script");
    s3.dataset.zone = "11550590";
    s3.src = "https://n6wxm.com/vignette.min.js";
    (document.body || root).appendChild(s3);

    return () => {
      try {
        head.removeChild(s2);
        if (s3.parentNode) s3.parentNode.removeChild(s3);
      } catch {
        /* ignore */
      }
    };
  }, [pathname]);

  return null;
}

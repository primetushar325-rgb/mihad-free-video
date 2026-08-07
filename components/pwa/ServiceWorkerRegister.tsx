"use client";

import { useEffect } from "react";
import { useSettings } from "@/components/SettingsProvider";

// Registers /sw.js when PWA is enabled in settings.
export default function ServiceWorkerRegister() {
  const settings = useSettings();
  useEffect(() => {
    if (!settings.enablePwa) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // dev only

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.warn("SW registration failed:", err));
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, [settings.enablePwa]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useSettings } from "@/components/SettingsProvider";

export default function ServiceWorkerRegister() {
  const settings = useSettings();
  useEffect(() => {
    if (!settings.enablePwa || !("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    const register = () => navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch((err) => console.warn("SW registration failed:", err));
    if (document.readyState === "complete") void register();
    else window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, [settings.enablePwa]);
  return null;
}

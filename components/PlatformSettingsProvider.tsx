"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { PlatformSettings } from "@/types";

const PlatformContext = createContext<PlatformSettings | null>(null);

export function PlatformSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    const controller = new AbortController();
    fetch("/api/platform-settings", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((json) => json.success && setSettings(json.data))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return <PlatformContext.Provider value={settings}>{children}</PlatformContext.Provider>;
}

export const usePlatformSettings = () => useContext(PlatformContext);

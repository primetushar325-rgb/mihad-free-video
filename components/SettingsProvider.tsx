"use client";

// ============================================================
// Client-side settings context. The root layout (server component)
// fetches settings from D1 and passes them here so any client
// component (AdSlot, install prompt, header) can read them.
// ============================================================

import { createContext, useContext, type ReactNode } from "react";
import type { Settings } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/safe";

const SettingsContext = createContext<Settings>(DEFAULT_SETTINGS);

export function useSettings(): Settings {
  return useContext(SettingsContext);
}

export function SettingsProvider({
  settings,
  children,
}: {
  settings: Settings;
  children: ReactNode;
}) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

"use client";

// ============================================================
// AdSlot — renders AdSense code from Settings, gracefully.
// Slots: "header" | "between_cards" | "details" | "footer"
// Renders nothing (no layout shift) if ads are disabled or empty.
// ============================================================

import { useSettings } from "@/components/SettingsProvider";
import { useEffect, useRef } from "react";
import type { Settings } from "@/types";

type Slot = "header" | "between_cards" | "details" | "footer";

const FIELD_BY_SLOT: Record<Slot, keyof Settings> = {
  header: "adsenseHeader",
  between_cards: "adsenseBetweenCards",
  details: "adsenseDetails",
  footer: "adsenseFooter",
};

export default function AdSlot({ slot }: { slot: Slot }) {
  const settings = useSettings();
  const ref = useRef<HTMLDivElement>(null);

  const field = FIELD_BY_SLOT[slot];
  const code = String(settings[field] ?? "");
  const enabled = settings.enableAds && code.trim().length > 0;

  // Inject the raw AdSense HTML safely. We use dangerouslySetInnerHTML
  // because AdSense provides a <script> tag; sanitization happens in
  // lib/validation before it is ever stored.
  useEffect(() => {
    if (!enabled || !ref.current) return;
    // The Google AdSense library pushes ads when re-injected; nothing to do
    // beyond rendering the markup (which the effect dependency handles).
  }, [enabled, code]);

  if (!enabled) return null;

  return (
    <div className="my-4 w-full overflow-hidden rounded-2xl">
      <div
        ref={ref}
        className="min-h-[90px] w-full"
        dangerouslySetInnerHTML={{ __html: code }}
      />
    </div>
  );
}

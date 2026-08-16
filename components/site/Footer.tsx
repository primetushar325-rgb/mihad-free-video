"use client";

// ============================================================
// Footer — site info, footer AdSense slot, settings-driven copy.
// ============================================================

import Link from "next/link";
import AdSlot from "@/components/site/AdSlot";
import { useSettings } from "@/components/SettingsProvider";

export default function Footer() {
  const settings = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/8 bg-black/40">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <AdSlot slot="footer" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-gradient text-sm font-black text-black">
              M
            </span>
            <span className="font-display font-bold text-gold-gradient">
              {settings.websiteName || "Mihad Free Video"}
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-neutral-400">
            <Link href="/" className="hover:text-gold-300">
              Home
            </Link>
            <Link href="/search" className="hover:text-gold-300">Search</Link>
            <Link href="/trending" className="hover:text-gold-300">Trending</Link>
            <Link href="/apps" className="hover:text-gold-300">Apps</Link>
            <Link href="/youtube" className="hover:text-gold-300">YouTube</Link>
            <Link href="/news" className="hover:text-gold-300">News</Link>
            <Link href="/admin" className="hover:text-gold-300">
              Admin
            </Link>
          </nav>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          {(settings.footerText || `© ${year} Mihad Free Video. All rights reserved.`).replace(
            "{year}",
            String(year)
          )}
        </p>
      </div>
    </footer>
  );
}

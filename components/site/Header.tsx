"use client";

// ============================================================
// Sticky glass Header with logo + collapsible mobile search.
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, X } from "lucide-react";
import SearchBar from "@/components/site/SearchBar";
import { useSettings } from "@/components/SettingsProvider";

export default function Header() {
  const settings = useSettings();
  const [searchOpen, setSearchOpen] = useState(false);
  const name = settings.websiteName || "Mihad Free Video";

  return (
    <header className="glass-strong sticky top-0 z-40 border-b border-gold-500/10">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:px-5">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label={name}
        >
          {settings.logoUrl ? (
            <Image
              src={settings.logoUrl}
              alt={name}
              width={40}
              height={40}
              className="h-9 w-9 rounded-xl object-cover sm:h-10 sm:w-10"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient text-lg font-black text-black shadow-gold sm:h-10 sm:w-10">
              M
            </span>
          )}
          <span className="hidden font-display text-lg font-extrabold tracking-tight text-gold-gradient sm:block">
            {name}
          </span>
        </Link>

        {/* Desktop search */}
        <div className="ml-auto hidden max-w-md flex-1 md:block">
          <SearchBar compact />
        </div>

        {/* Mobile actions */}
        <div className="ml-auto flex items-center gap-1.5 md:hidden">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-200"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile expandable search */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          searchOpen ? "max-h-24 pb-3" : "max-h-0"
        }`}
      >
        <div className="px-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}

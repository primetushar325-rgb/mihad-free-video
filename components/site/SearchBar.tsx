"use client";

// ============================================================
// SearchBar — instant, debounced live search with a results
// dropdown. Pressing Enter goes to the full /search page.
// ============================================================

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import type { VideoWithCategory } from "@/types";
import { timeAgo } from "@/lib/utils";

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<VideoWithCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced live search
  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/videos?q=${encodeURIComponent(q)}&limit=8`);
        const json = await res.json();
        setResults(json.data?.items ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [term]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = term.trim();
    setOpen(false);
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search videos, tags, categories…"
          className={`field pl-10 pr-10 ${compact ? "py-2.5" : "py-3"}`}
          aria-label="Search videos"
        />
        {term && (
          <button
            type="button"
            onClick={() => {
              setTerm("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Live dropdown */}
      {open && term.trim().length >= 2 && (
        <div className="glass-strong absolute z-50 mt-2 max-h-[70vh] w-full overflow-y-auto rounded-2xl border border-gold-500/20 p-2 shadow-gold">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-3 py-3 text-sm text-neutral-400">
              No videos match “{term}”.
            </div>
          )}
          {!loading &&
            results.map((v) => (
              <Link
                key={v.id}
                href={`/video/${v.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gold-500/10"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  <Image
                    src={v.thumbnailUrl}
                    alt={v.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {v.title}
                  </p>
                  <p className="truncate text-xs text-neutral-400">
                    {v.categoryName ?? "Uncategorized"} ·{" "}
                    {timeAgo(v.uploadTime || v.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          {!loading && results.length > 0 && (
            <button
              onClick={submit}
              className="mt-1 w-full rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-gold-300 hover:bg-gold-500/10"
            >
              View all results for “{term}” →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

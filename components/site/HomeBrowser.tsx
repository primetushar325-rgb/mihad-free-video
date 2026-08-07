"use client";

// ============================================================
// HomeBrowser — instant client-side category filtering over the
// server-rendered video list. No reloads, smooth layout animations.
// ============================================================

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import CategoryNav, { type ActiveCategory } from "@/components/site/CategoryNav";
import VideoGrid from "@/components/site/VideoGrid";
import type { Category, VideoWithCategory } from "@/types";

export default function HomeBrowser({
  categories,
  videos,
}: {
  categories: Category[];
  videos: VideoWithCategory[];
}) {
  const [active, setActive] = useState<ActiveCategory>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = videos;
    if (active !== "all") {
      list = list.filter((v) => v.categoryId === active);
    }
    if (featuredOnly) {
      list = list.filter((v) => v.featured);
    }
    return list;
  }, [videos, active, featuredOnly]);

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-5">
      {/* Section heading + filters */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-white sm:text-2xl">
            Browse Videos
          </h2>
          <p className="text-sm text-neutral-400">
            {filtered.length} video{filtered.length === 1 ? "" : "s"} available
          </p>
        </div>
        <button
          onClick={() => setFeaturedOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
            featuredOnly
              ? "border-transparent bg-gold-gradient text-black shadow-gold"
              : "border-white/10 bg-white/5 text-neutral-300 hover:text-white"
          }`}
          aria-pressed={featuredOnly}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Featured
        </button>
      </div>

      <CategoryNav
        categories={categories}
        active={active}
        onChange={setActive}
      />

      <motion.div layout className="mt-5">
        <VideoGrid videos={filtered} showAds />
      </motion.div>
    </section>
  );
}

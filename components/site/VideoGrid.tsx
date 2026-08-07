"use client";

// ============================================================
// VideoGrid — responsive grid of VideoCards.
// Featured cards span two columns (golden glow handled in VideoCard).
// An AdSlot is injected as a full-width row every `adInterval` cards.
// ============================================================

import { Fragment } from "react";
import VideoCard from "@/components/site/VideoCard";
import AdSlot from "@/components/site/AdSlot";
import { Film } from "lucide-react";
import type { VideoWithCategory } from "@/types";

export default function VideoGrid({
  videos,
  showAds = true,
  adInterval = 8,
}: {
  videos: VideoWithCategory[];
  showAds?: boolean;
  adInterval?: number;
}) {
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/8 bg-black/40 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-400">
          <Film className="h-8 w-8" />
        </div>
        <h3 className="font-display text-lg font-semibold text-white">
          No videos found
        </h3>
        <p className="mt-1 max-w-xs text-sm text-neutral-400">
          Try a different category or search term. New videos are added
          regularly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {videos.map((video, i) => (
        <Fragment key={video.id}>
          <VideoCard video={video} index={i} />
          {showAds && (i + 1) % adInterval === 0 && i < videos.length - 1 && (
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <AdSlot slot="between_cards" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

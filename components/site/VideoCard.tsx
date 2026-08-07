"use client";

// ============================================================
// VideoCard — 1:1 thumbnail, category badge, featured badge,
// upload time, golden hover. Featured cards get a golden glow.
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Clock } from "lucide-react";
import type { VideoWithCategory } from "@/types";
import { timeAgo } from "@/lib/utils";

export default function VideoCard({
  video,
  index = 0,
}: {
  video: VideoWithCategory;
  index?: number;
}) {
  const featured = video.featured;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      className={featured ? "sm:col-span-2 sm:row-span-1" : ""}
    >
      <Link
        href={`/video/${video.id}`}
        className={`group relative block overflow-hidden rounded-3xl border bg-black/60 transition-all duration-300 hover:-translate-y-1 ${
          featured
            ? "border-gold-500/60 shadow-gold hover:shadow-gold-lg animate-glow-pulse"
            : "border-white/8 hover:border-gold-500/50 hover:shadow-gold"
        }`}
      >
        {/* 1:1 thumbnail */}
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading={index < 4 ? "eager" : "lazy"}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
            {video.categoryName && (
              <span className="badge glass text-gold-300">
                {video.categoryName}
              </span>
            )}
          </div>
          {featured && (
            <div className="absolute right-2 top-2">
              <span className="badge bg-gold-gradient text-black shadow-gold">
                <Star className="h-3 w-3 fill-black" /> Featured
              </span>
            </div>
          )}

          {/* Title + meta on the image */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3
              className={`line-clamp-2 font-display font-semibold text-white ${
                featured ? "text-base sm:text-lg" : "text-sm"
              }`}
            >
              {video.title}
            </h3>
            {video.description && (
              <p className="mt-1 line-clamp-1 text-xs text-neutral-300/80">
                {video.description}
              </p>
            )}
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-neutral-400">
              <Clock className="h-3 w-3" />
              {timeAgo(video.uploadTime || video.createdAt)}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

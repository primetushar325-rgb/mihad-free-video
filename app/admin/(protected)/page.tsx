"use client";

// ============================================================
// Admin dashboard — stats, recent videos, quick actions.
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Film,
  FolderTree,
  Star,
  Images,
  Plus,
  ArrowRight,
  Settings,
  Megaphone,
  Eye,
  Download,
  Users,
} from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/admin/PageHeader";
import Loader from "@/components/admin/Loader";
import { timeAgo } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<DashboardStats>("/api/dashboard");
        setStats(data);
      } catch (err) {
        toast.error((err as ApiError).message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  if (loading) return <Loader label="Loading dashboard…" />;
  if (!stats) {
    return (
      <div className="card text-center text-neutral-300">
        Could not load dashboard data. Make sure your database is configured.
      </div>
    );
  }

  const libraryCards = [
    { label: "Total Videos", value: stats.totalVideos, icon: Film, color: "text-gold-400" },
    { label: "Categories", value: stats.totalCategories, icon: FolderTree, color: "text-sky-400" },
    { label: "Featured", value: stats.totalFeatured, icon: Star, color: "text-amber-400" },
    { label: "Slides", value: stats.totalSlides, icon: Images, color: "text-emerald-400" },
  ];

  const trafficCards = [
    { label: "Total Visits", value: stats.totalVisits, icon: Eye, color: "text-sky-400" },
    { label: "Unique Visitors", value: stats.uniqueVisitors, icon: Users, color: "text-violet-400" },
    { label: "Visits Today", value: stats.todayVisits, icon: Eye, color: "text-emerald-400" },
    { label: "Total Downloads", value: stats.totalDownloads, icon: Download, color: "text-amber-400" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your video library"
      />

      {/* Library stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {libraryCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card">
              <div className={`mb-3 inline-flex rounded-xl bg-white/5 p-2.5 ${c.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-display text-3xl font-extrabold text-white">
                {c.value}
              </p>
              <p className="text-xs text-neutral-400">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Visitor & download stats */}
      <h2 className="mb-3 mt-6 font-display text-lg font-bold text-white">
        Visitors & Downloads
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {trafficCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card border-gold-500/20">
              <div className={`mb-3 inline-flex rounded-xl bg-white/5 p-2.5 ${c.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-display text-3xl font-extrabold text-white">
                {c.value}
              </p>
              <p className="text-xs text-neutral-400">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Top downloaded videos */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">
            Most Downloaded Videos
          </h2>
        </div>
        {stats.topDownloads.length === 0 ? (
          <div className="card text-center text-sm text-neutral-400">
            No downloads recorded yet. Downloads will appear here once visitors start downloading.
          </div>
        ) : (
          <div className="space-y-2">
            {stats.topDownloads.map((d, i) => (
              <div
                key={d.videoId}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/40 p-2.5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-gradient text-xs font-black text-black">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {d.videoTitle || `Video #${d.videoId}`}
                  </p>
                  <p className="text-xs text-neutral-400">Video #{d.videoId}</p>
                </div>
                <span className="badge bg-white/5 text-gold-300">
                  <Download className="h-3 w-3" /> {d.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickAction href="/admin/videos" icon={Plus} label="Add Video" />
        <QuickAction href="/admin/slides" icon={Images} label="Manage Slider" />
        <QuickAction href="/admin/ads" icon={Megaphone} label="Configure Ads" />
      </div>

      {/* Recent videos */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">
            Recent Videos
          </h2>
          <Link
            href="/admin/videos"
            className="inline-flex items-center gap-1 text-sm text-gold-300 hover:text-gold-200"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {stats.recentVideos.length === 0 ? (
          <div className="card text-center text-sm text-neutral-400">
            No videos yet.{" "}
            <Link href="/admin/videos" className="text-gold-300">
              Add your first video →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recentVideos.map((v) => (
              <Link
                key={v.id}
                href="/admin/videos"
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/40 p-2.5 transition-colors hover:border-gold-500/30"
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
                    {timeAgo(v.createdAt)}
                  </p>
                </div>
                {v.featured && (
                  <span className="badge bg-gold-gradient text-black">
                    <Star className="h-3 w-3 fill-black" />
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/admin/settings"
          className="card flex items-center gap-3 hover:border-gold-500/30"
        >
          <Settings className="h-5 w-5 text-gold-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Site Settings</p>
            <p className="text-xs text-neutral-400">
              Update name, logo, colors, PWA and more
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-neutral-400" />
        </Link>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="card flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-gold"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-gradient text-black">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-white">{label}</span>
      <ArrowRight className="ml-auto h-4 w-4 text-neutral-400" />
    </Link>
  );
}

"use client";

// ============================================================
// VideosManager — list, search, filter, create/edit/delete, bulk delete.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
} from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/admin/PageHeader";
import Loader from "@/components/admin/Loader";
import VideoFormModal from "@/components/admin/VideoFormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { timeAgo } from "@/lib/utils";
import type { Category, VideoWithCategory } from "@/types";

type FeaturedFilter = "all" | "featured" | "normal";

export default function VideosManager() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [featFilter, setFeatFilter] = useState<FeaturedFilter>("all");

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VideoWithCategory | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, cRes] = await Promise.all([
        api.get<{ items: VideoWithCategory[] }>("/api/videos?limit=1000"),
        api.get<{ items: Category[] }>("/api/categories?all=1"),
      ]);
      setVideos(vRes.items ?? []);
      setCategories(cRes.items ?? []);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return videos.filter((v) => {
      if (catFilter !== "all" && String(v.categoryId) !== catFilter) return false;
      if (featFilter === "featured" && !v.featured) return false;
      if (featFilter === "normal" && v.featured) return false;
      if (q) {
        const hay = `${v.title} ${v.description} ${v.tags.join(
          " "
        )} ${v.categoryName ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [videos, search, catFilter, featFilter]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(v: VideoWithCategory) {
    setEditing(v);
    setFormOpen(true);
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }
  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === filtered.length
        ? new Set()
        : new Set(filtered.map((v) => v.id))
    );
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.del(`/api/videos/${deleteId}`);
      toast.success("Video deleted");
      setDeleteId(null);
      await load();
    } catch (err) {
      toast.error((err as ApiError).message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  async function confirmBulkDelete() {
    setDeleting(true);
    try {
      const res = await api.del<{ removed: number }>("/api/videos", {
        ids: Array.from(selected),
      });
      toast.success(`${res.removed} video(s) deleted`);
      setSelected(new Set());
      setBulkDeleteOpen(false);
      await load();
    } catch (err) {
      toast.error((err as ApiError).message || "Bulk delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <Loader label="Loading videos…" />;

  return (
    <div>
      <PageHeader
        title="Videos"
        subtitle={`${videos.length} total · ${selected.size} selected`}
        action={
          <button onClick={openCreate} className="btn-gold">
            <Plus className="h-4 w-4" /> Add Video
          </button>
        }
      />

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, tag, description…"
            className="field pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="field max-w-[180px] py-2.5"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={featFilter}
            onChange={(e) => setFeatFilter(e.target.value as FeaturedFilter)}
            className="field max-w-[160px] py-2.5"
          >
            <option value="all">All videos</option>
            <option value="featured">Featured only</option>
            <option value="normal">Normal only</option>
          </select>
          {selected.size > 0 && (
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="btn-danger ml-auto"
            >
              <Trash2 className="h-4 w-4" /> Delete {selected.size}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card text-center text-sm text-neutral-400">
          {videos.length === 0 ? (
            <>
              No videos yet.{" "}
              <button onClick={openCreate} className="text-gold-300">
                Add your first video →
              </button>
            </>
          ) : (
            "No videos match your filters."
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/8">
          {/* Header (desktop) */}
          <div className="hidden items-center gap-3 border-b border-white/8 bg-black/40 px-4 py-3 text-xs font-medium text-neutral-400 sm:flex">
            <input
              type="checkbox"
              checked={
                selected.size === filtered.length && filtered.length > 0
              }
              onChange={toggleSelectAll}
              className="h-4 w-4 accent-gold-500"
            />
            <span className="flex-1">Video</span>
            <span className="w-28">Category</span>
            <span className="w-20">Status</span>
            <span className="w-24 text-right">Actions</span>
          </div>

          <div className="divide-y divide-white/5">
            {filtered.map((v) => (
              <div
                key={v.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-white/3"
              >
                <input
                  type="checkbox"
                  checked={selected.has(v.id)}
                  onChange={() => toggleSelect(v.id)}
                  className="h-4 w-4 accent-gold-500"
                />
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  <Image
                    src={v.thumbnailUrl}
                    alt={v.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-[160px] flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-white">
                    {v.title}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {timeAgo(v.createdAt)}
                  </p>
                </div>
                <span className="w-28 text-xs text-neutral-300">
                  {v.categoryName ?? "—"}
                </span>
                <span className="w-20">
                  {v.featured ? (
                    <span className="badge bg-gold-gradient text-black">
                      <Star className="h-3 w-3 fill-black" /> Featured
                    </span>
                  ) : (
                    <span className="badge border border-white/10 bg-white/5 text-neutral-400">
                      Normal
                    </span>
                  )}
                </span>
                <div className="flex w-24 justify-end gap-1">
                  <button
                    onClick={() => openEdit(v)}
                    aria-label="Edit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-gold-500/15 hover:text-gold-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(v.id)}
                    aria-label="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-red-500/15 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <VideoFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        categories={categories}
        editing={editing}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete this video?"
        message="The video will be permanently removed from your library."
        loading={deleting}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selected.size} videos?`}
        message="These videos will be permanently removed."
        confirmText="Delete all"
        loading={deleting}
      />
    </div>
  );
}

"use client";

// ============================================================
// Add / Edit video form with live thumbnail preview.
// ============================================================

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Save, Star } from "lucide-react";
import Modal from "@/components/admin/Modal";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import type { Category, VideoWithCategory } from "@/types";

interface FormState {
  title: string;
  description: string;
  thumbnailUrl: string;
  googleDriveUrl: string;
  tags: string;
  categoryId: string;
  uploadTime: string;
  featured: boolean;
}

function emptyForm(): FormState {
  return {
    title: "",
    description: "",
    thumbnailUrl: "",
    googleDriveUrl: "",
    tags: "",
    categoryId: "",
    uploadTime: new Date().toISOString().slice(0, 16),
    featured: false,
  };
}

export default function VideoFormModal({
  open,
  onClose,
  categories,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  editing: VideoWithCategory | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description,
        thumbnailUrl: editing.thumbnailUrl,
        googleDriveUrl: editing.googleDriveUrl,
        tags: editing.tags.join(", "),
        categoryId: editing.categoryId ? String(editing.categoryId) : "",
        uploadTime:
          (editing.uploadTime || editing.createdAt || "").slice(0, 16) ||
          new Date().toISOString().slice(0, 16),
        featured: editing.featured,
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, editing]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      thumbnailUrl: form.thumbnailUrl,
      googleDriveUrl: form.googleDriveUrl,
      tags: form.tags,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      uploadTime: form.uploadTime ? new Date(form.uploadTime).toISOString() : new Date().toISOString(),
      featured: form.featured,
    };

    try {
      if (editing) {
        await api.put(`/api/videos/${editing.id}`, payload);
        toast.success("Video updated");
      } else {
        await api.post("/api/videos", payload);
        toast.success("Video created");
      }
      onSaved();
      onClose();
    } catch (err) {
      const e = err as ApiError;
      if (e.errors) setErrors(e.errors);
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Video" : "Add New Video"}
      size="lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Title *</label>
            <input
              className={`field ${errors.title ? "field-error" : ""}`}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Amazing Video Title"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea
              className="field min-h-[80px] resize-y"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Short description of the video…"
            />
          </div>

          <div>
            <label className="label">Thumbnail Image URL *</label>
            <input
              className={`field ${errors.thumbnailUrl ? "field-error" : ""}`}
              value={form.thumbnailUrl}
              onChange={(e) => set("thumbnailUrl", e.target.value)}
              placeholder="https://…/thumbnail.jpg"
            />
            {errors.thumbnailUrl && (
              <p className="mt-1 text-xs text-red-400">{errors.thumbnailUrl}</p>
            )}
          </div>

          <div>
            <label className="label">Google Drive Link *</label>
            <input
              className={`field ${errors.googleDriveUrl ? "field-error" : ""}`}
              value={form.googleDriveUrl}
              onChange={(e) => set("googleDriveUrl", e.target.value)}
              placeholder="https://drive.google.com/…"
            />
            {errors.googleDriveUrl && (
              <p className="mt-1 text-xs text-red-400">{errors.googleDriveUrl}</p>
            )}
          </div>

          <div>
            <label className="label">Category</label>
            <select
              className="field"
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
            >
              <option value="">— Uncategorized —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon ? `${c.icon} ` : ""}
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Tags (comma separated)</label>
            <input
              className="field"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="anime, 4k, action"
            />
          </div>

          <div>
            <label className="label">Upload Time</label>
            <input
              type="datetime-local"
              className="field"
              value={form.uploadTime}
              onChange={(e) => set("uploadTime", e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <label className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-neutral-200">
                <Star className="h-4 w-4 text-gold-400" /> Featured
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              <span
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  form.featured ? "bg-gold-500" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    form.featured ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </label>
          </div>
        </div>

        {/* Live preview */}
        {form.thumbnailUrl && (
          <div>
            <label className="label">Live Preview</label>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <Image
                src={form.thumbnailUrl}
                alt="preview"
                fill
                sizes="300px"
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="truncate text-sm font-semibold text-white">
                  {form.title || "Video title"}
                </p>
              </div>
              {form.featured && (
                <span className="badge absolute right-2 top-2 bg-gold-gradient text-black">
                  <Star className="h-3 w-3 fill-black" /> Featured
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-gold flex-1">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" /> {editing ? "Save changes" : "Create video"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

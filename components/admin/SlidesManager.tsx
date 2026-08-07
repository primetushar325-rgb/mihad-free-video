"use client";

// ============================================================
// SlidesManager — create, edit, delete, enable/disable, reorder.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  Images,
} from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/admin/PageHeader";
import Loader from "@/components/admin/Loader";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Slide } from "@/types";

interface FormState {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
}
const empty: FormState = {
  imageUrl: "",
  title: "",
  subtitle: "",
  buttonText: "",
  buttonLink: "",
  active: true,
};

export default function SlidesManager() {
  const { toast } = useToast();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ items: Slide[] }>("/api/slides?all=1");
      setSlides(data.items ?? []);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load slides");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setFormOpen(true);
  }
  function openEdit(s: Slide) {
    setEditing(s);
    setForm({
      imageUrl: s.imageUrl,
      title: s.title,
      subtitle: s.subtitle,
      buttonText: s.buttonText,
      buttonLink: s.buttonLink,
      active: s.active,
    });
    setFormOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/slides/${editing.id}`, form);
        toast.success("Slide updated");
      } else {
        await api.post("/api/slides", form);
        toast.success("Slide created");
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      toast.error((err as ApiError).message || "Save failed");
    }
  }

  async function toggleActive(s: Slide) {
    setSavingId(s.id);
    try {
      await api.put(`/api/slides/${s.id}`, { active: !s.active });
      await load();
    } catch (err) {
      toast.error((err as ApiError).message || "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  async function move(s: Slide, dir: -1 | 1) {
    const idx = slides.findIndex((x) => x.id === s.id);
    const target = idx + dir;
    if (target < 0 || target >= slides.length) return;
    setSavingId(s.id);
    try {
      await api.put(`/api/slides/${s.id}`, {
        orderNumber: slides[target].orderNumber,
      });
      await api.put(`/api/slides/${slides[target].id}`, {
        orderNumber: s.orderNumber,
      });
      await load();
    } catch (err) {
      toast.error((err as ApiError).message || "Reorder failed");
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.del(`/api/slides/${deleteId}`);
      toast.success("Slide deleted");
      setDeleteId(null);
      await load();
    } catch (err) {
      toast.error((err as ApiError).message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <Loader label="Loading slides…" />;

  return (
    <div>
      <PageHeader
        title="Hero Slider"
        subtitle={`${slides.length} slides · unlimited supported`}
        action={
          <button onClick={openCreate} className="btn-gold">
            <Plus className="h-4 w-4" /> Add Slide
          </button>
        }
      />

      {slides.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <Images className="h-10 w-10 text-neutral-600" />
          <p className="text-sm text-neutral-400">
            No slides yet. Add your first hero slide.
          </p>
          <button onClick={openCreate} className="btn-gold">
            <Plus className="h-4 w-4" /> Add Slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="overflow-hidden rounded-3xl border border-white/8 bg-black/40"
            >
              <div className="flex flex-col gap-3 p-3 sm:flex-row">
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-white/5 sm:h-24 sm:w-40">
                  {s.imageUrl ? (
                    <Image
                      src={s.imageUrl}
                      alt={s.title}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-600">
                      <Images className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-gold-500/15 text-gold-300">
                      #{s.orderNumber}
                    </span>
                    <span
                      className={`badge ${
                        s.active
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border border-white/10 bg-white/5 text-neutral-500"
                      }`}
                    >
                      {s.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {s.title || "Untitled slide"}
                  </p>
                  <p className="line-clamp-1 text-xs text-neutral-400">
                    {s.subtitle || "—"}
                  </p>
                  {s.buttonText && (
                    <span className="mt-1 inline-block text-xs text-gold-300">
                      Button: “{s.buttonText}” → {s.buttonLink || "/"}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <button
                    onClick={() => move(s, -1)}
                    disabled={i === 0 || savingId === s.id}
                    aria-label="Move up"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-white/5 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => move(s, 1)}
                    disabled={i === slides.length - 1 || savingId === s.id}
                    aria-label="Move down"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-white/5 disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(s)}
                    disabled={savingId === s.id}
                    aria-label="Toggle active"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-gold-500/15 hover:text-gold-300"
                  >
                    {s.active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(s)}
                    aria-label="Edit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-gold-500/15 hover:text-gold-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    aria-label="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-red-500/15 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Slide" : "Add Slide"}
        size="lg"
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Image URL *</label>
            <input
              className="field"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://…/banner.jpg"
            />
          </div>
          {form.imageUrl && (
            <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <Image
                src={form.imageUrl}
                alt="preview"
                fill
                sizes="400px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Title</label>
              <input
                className="field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Slide title"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Subtitle</label>
              <input
                className="field"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Short subtitle text"
              />
            </div>
            <div>
              <label className="label">Button Text</label>
              <input
                className="field"
                value={form.buttonText}
                onChange={(e) =>
                  setForm({ ...form, buttonText: e.target.value })
                }
                placeholder="Explore Now"
              />
            </div>
            <div>
              <label className="label">Button Link</label>
              <input
                className="field"
                value={form.buttonLink}
                onChange={(e) =>
                  setForm({ ...form, buttonLink: e.target.value })
                }
                placeholder="/ or https://…"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-neutral-200">Active (show on site)</span>
            <input
              type="checkbox"
              className="sr-only"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.active ? "bg-gold-500" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                  form.active ? "left-[22px]" : "left-0.5"
                }`}
              />
            </span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-gold flex-1">
              <Save className="h-4 w-4" /> {editing ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete this slide?"
        message="The slide will be removed from your hero slider."
        loading={deleting}
      />
    </div>
  );
}

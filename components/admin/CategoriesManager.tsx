"use client";

// ============================================================
// CategoriesManager — create, rename, hide/show, reorder, delete.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  FolderTree,
} from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/admin/PageHeader";
import Loader from "@/components/admin/Loader";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types";

export default function CategoriesManager() {
  const { toast } = useToast();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [slug, setSlug] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ items: Category[] }>(
        "/api/categories?all=1"
      );
      setCats(data.items ?? []);
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setIcon("");
    setSlug("");
    setFormOpen(true);
  }
  function openEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setIcon(c.icon);
    setSlug(c.slug);
    setFormOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/categories/${editing.id}`, {
          name,
          icon,
          slug: slug || undefined,
        });
        toast.success("Category updated");
      } else {
        await api.post("/api/categories", {
          name,
          icon,
          slug: slug || undefined,
        });
        toast.success("Category created");
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.message || "Save failed");
    }
  }

  async function toggleVisible(c: Category) {
    setSavingId(c.id);
    try {
      await api.put(`/api/categories/${c.id}`, { isVisible: !c.isVisible });
      await load();
    } catch (err) {
      toast.error((err as ApiError).message || "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  async function move(c: Category, dir: -1 | 1) {
    const idx = cats.findIndex((x) => x.id === c.id);
    const target = idx + dir;
    if (target < 0 || target >= cats.length) return;
    setSavingId(c.id);
    try {
      // Swap order numbers with the neighbour.
      await api.put(`/api/categories/${c.id}`, {
        orderNumber: cats[target].orderNumber,
      });
      await api.put(`/api/categories/${cats[target].id}`, {
        orderNumber: c.orderNumber,
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
      await api.del(`/api/categories/${deleteId}`);
      toast.success("Category deleted");
      setDeleteId(null);
      await load();
    } catch (err) {
      toast.error((err as ApiError).message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <Loader label="Loading categories…" />;

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${cats.length} categories`}
        action={
          <button onClick={openCreate} className="btn-gold">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        }
      />

      {cats.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <FolderTree className="h-10 w-10 text-neutral-600" />
          <p className="text-sm text-neutral-400">
            No categories yet. Create your first one.
          </p>
          <button onClick={openCreate} className="btn-gold">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {cats.map((c, i) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/40 p-3"
            >
              <span className="text-xl">{c.icon || "📁"}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {c.name}
                </p>
                <p className="truncate text-xs text-neutral-500">
                  /category/{c.slug}
                </p>
              </div>
              <span
                className={`badge ${
                  c.isVisible
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border border-white/10 bg-white/5 text-neutral-500"
                }`}
              >
                {c.isVisible ? (
                  <>
                    <Eye className="h-3 w-3" /> Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" /> Hidden
                  </>
                )}
              </span>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => move(c, -1)}
                  disabled={i === 0 || savingId === c.id}
                  aria-label="Move up"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-white/5 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(c, 1)}
                  disabled={i === cats.length - 1 || savingId === c.id}
                  aria-label="Move down"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-white/5 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => toggleVisible(c)}
                disabled={savingId === c.id}
                aria-label="Toggle visibility"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-gold-500/15 hover:text-gold-300"
              >
                {c.isVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => openEdit(c)}
                aria-label="Edit"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-gold-500/15 hover:text-gold-300"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteId(c.id)}
                aria-label="Delete"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-red-500/15 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              className="field"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editing) setSlug(slugify(e.target.value));
              }}
              placeholder="Anime"
            />
          </div>
          <div>
            <label className="label">Icon (emoji or short text)</label>
            <input
              className="field"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🌸"
              maxLength={8}
            />
          </div>
          <div>
            <label className="label">Slug (URL)</label>
            <input
              className="field"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="anime"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Leave blank to auto-generate from name.
            </p>
          </div>
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
        title="Delete this category?"
        message="Videos in this category will become uncategorized (not deleted)."
        loading={deleting}
      />
    </div>
  );
}

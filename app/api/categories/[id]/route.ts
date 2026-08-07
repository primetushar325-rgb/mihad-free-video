// PUT    /api/categories/:id — admin
// DELETE /api/categories/:id — admin

import { withErrorHandler, readJson, ok, badRequest, notFound } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { validateCategory } from "@/lib/validation";
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/repository";

export const runtime = "nodejs";

export const PUT = withErrorHandler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id } = await params;
    const existing = await getCategoryById(Number(id));
    if (!existing) return notFound("Category not found.");
    const body = await readJson(req);
    const { errors, value } = validateCategory(body);
    if (Object.keys(errors).length) return badRequest("Validation failed.", errors);

    await updateCategory(Number(id), value);
    const updated = await getCategoryById(Number(id));
    return ok(updated, "Category updated.");
  }
);

export const DELETE = withErrorHandler(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id } = await params;
    const changes = await deleteCategory(Number(id));
    if (!changes) return notFound("Category not found.");
    return ok({ id: Number(id) }, "Category deleted.");
  }
);

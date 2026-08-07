// PUT    /api/slides/:id — admin
// DELETE /api/slides/:id — admin

import { withErrorHandler, readJson, ok, badRequest, notFound } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { validateSlide } from "@/lib/validation";
import { getSlideById, updateSlide, deleteSlide } from "@/lib/repository";

export const runtime = "nodejs";

export const PUT = withErrorHandler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id } = await params;
    const existing = await getSlideById(Number(id));
    if (!existing) return notFound("Slide not found.");
    const body = await readJson(req);
    const { errors, value } = validateSlide(body);
    if (Object.keys(errors).length) return badRequest("Validation failed.", errors);

    await updateSlide(Number(id), value);
    const updated = await getSlideById(Number(id));
    return ok(updated, "Slide updated.");
  }
);

export const DELETE = withErrorHandler(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id } = await params;
    const changes = await deleteSlide(Number(id));
    if (!changes) return notFound("Slide not found.");
    return ok({ id: Number(id) }, "Slide deleted.");
  }
);

// GET    /api/videos/:id  — public
// PUT    /api/videos/:id  — admin
// DELETE /api/videos/:id  — admin

import {
  withErrorHandler,
  readJson,
  ok,
  badRequest,
  notFound,
} from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { validateVideo } from "@/lib/validation";
import { getVideoById, updateVideo, deleteVideo } from "@/lib/repository";

export const runtime = "nodejs";

export const GET = withErrorHandler(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const video = await getVideoById(Number(id));
    if (!video) return notFound("Video not found.");
    return ok(video);
  }
);

export const PUT = withErrorHandler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id } = await params;
    const existing = await getVideoById(Number(id));
    if (!existing) return notFound("Video not found.");
    const body = await readJson(req);
    const { errors, value } = validateVideo(body);
    if (Object.keys(errors).length) return badRequest("Validation failed.", errors);

    await updateVideo(Number(id), value);
    const updated = await getVideoById(Number(id));
    return ok(updated, "Video updated.");
  }
);

export const DELETE = withErrorHandler(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id } = await params;
    const changes = await deleteVideo(Number(id));
    if (!changes) return notFound("Video not found.");
    return ok({ id: Number(id) }, "Video deleted.");
  }
);

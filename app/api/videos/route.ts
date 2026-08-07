// GET  /api/videos       — list videos (public)
// POST /api/videos       — create video (admin)
// DELETE /api/videos     — bulk delete (admin)

import { withErrorHandler, readJson, ok, created, badRequest } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { validateVideo } from "@/lib/validation";
import {
  listVideos,
  searchVideos,
  createVideo,
  getVideoById,
  deleteVideos,
} from "@/lib/repository";

export const runtime = "nodejs";

export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const categoryIdParam = url.searchParams.get("categoryId");
  const featuredParam = url.searchParams.get("featured");
  const limitParam = url.searchParams.get("limit");
  const offsetParam = url.searchParams.get("offset");

  const categoryId =
    categoryIdParam && categoryIdParam !== "all"
      ? Number(categoryIdParam)
      : undefined;
  const featured =
    featuredParam === null
      ? undefined
      : featuredParam === "true" || featuredParam === "1"
      ? true
      : featuredParam === "false" || featuredParam === "0"
      ? false
      : undefined;
  const limit = limitParam ? Math.min(Math.max(1, Number(limitParam)), 200) : undefined;
  const offset = offsetParam ? Math.max(0, Number(offsetParam)) : 0;

  let items;
  if (q) {
    items = await searchVideos(q, { categoryId, featured, limit });
  } else {
    items = await listVideos({ categoryId, featured, limit, offset });
  }
  return ok({ items });
});

export const POST = withErrorHandler(async (req: Request) => {
  await requireAdmin();
  const body = await readJson(req);
  const { errors, value } = validateVideo(body);
  if (Object.keys(errors).length) return badRequest("Validation failed.", errors);

  const id = await createVideo(value);
  const created_video = await getVideoById(id);
  return created(created_video, "Video created.");
});

export const DELETE = withErrorHandler(async (req: Request) => {
  await requireAdmin();
  const body = await readJson(req);
  const idsRaw = (body as { ids?: unknown }).ids;
  if (!Array.isArray(idsRaw) || idsRaw.length === 0)
    return badRequest("Provide an array of ids.");
  const ids = idsRaw.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  const removed = await deleteVideos(ids);
  return ok({ removed }, `${removed} video(s) deleted.`);
});

export const dynamic = "force-dynamic";

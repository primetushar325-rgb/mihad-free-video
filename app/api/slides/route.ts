// GET  /api/slides — public list of active slides
// POST /api/slides — admin create

import { withErrorHandler, readJson, ok, created, badRequest } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { validateSlide } from "@/lib/validation";
import { listSlides, createSlide, getSlideById } from "@/lib/repository";

export const runtime = "nodejs";

export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "1";
  if (all) {
    await requireAdmin();
    return ok({ items: await listSlides() });
  }
  return ok({ items: await listSlides({ onlyActive: true }) });
});

export const POST = withErrorHandler(async (req: Request) => {
  await requireAdmin();
  const body = await readJson(req);
  const { errors, value } = validateSlide(body);
  if (Object.keys(errors).length) return badRequest("Validation failed.", errors);

  const id = await createSlide(value);
  const slide = await getSlideById(id);
  return created(slide, "Slide created.");
});

export const dynamic = "force-dynamic";

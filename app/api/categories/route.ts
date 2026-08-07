// GET  /api/categories — public list of visible categories
// POST /api/categories — admin create

import { withErrorHandler, readJson, ok, created, badRequest } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { validateCategory } from "@/lib/validation";
import { listCategories, getAllCategories, createCategory, getCategoryById } from "@/lib/repository";

export const runtime = "nodejs";

export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "1"; // admin fetches hidden too
  if (all) {
    await requireAdmin();
    return ok({ items: await getAllCategories() });
  }
  return ok({ items: await listCategories() });
});

export const POST = withErrorHandler(async (req: Request) => {
  await requireAdmin();
  const body = await readJson(req);
  const { errors, value } = validateCategory(body);
  if (Object.keys(errors).length) return badRequest("Validation failed.", errors);

  const id = await createCategory(value);
  const category = await getCategoryById(id);
  return created(category, "Category created.");
});

export const dynamic = "force-dynamic";

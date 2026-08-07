// GET /api/dashboard — admin stats

import { withErrorHandler, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/lib/repository";

export const runtime = "nodejs";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  return ok(await getDashboardStats());
});

// GET /api/auth/me — returns the current admin (or null) for the admin SPA.
import { withErrorHandler, ok } from "@/lib/api";
import { getCurrentAdmin } from "@/lib/auth";

export const GET = withErrorHandler(async () => {
  const admin = await getCurrentAdmin();
  return ok({ admin });
});

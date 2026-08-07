// POST /api/auth/logout
import { withErrorHandler, ok } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

export const POST = withErrorHandler(async () => {
  await clearSessionCookie();
  return ok({ success: true }, "Logged out");
});

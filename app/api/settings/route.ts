// GET /api/settings — public (site settings: name, logo, etc.)
// PUT /api/settings — admin update

import { withErrorHandler, readJson, ok, badRequest } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { validateSettings } from "@/lib/validation";
import { getSettings, updateSettings } from "@/lib/repository";

export const runtime = "nodejs";

export const GET = withErrorHandler(async () => {
  return ok(await getSettings());
});

export const PUT = withErrorHandler(async (req: Request) => {
  await requireAdmin();
  const body = await readJson(req);
  const { errors, value } = validateSettings(body);
  if (Object.keys(errors).length) return badRequest("Validation failed.", errors);

  await updateSettings(value);
  const settings = await getSettings();
  return ok(settings, "Settings saved.");
});

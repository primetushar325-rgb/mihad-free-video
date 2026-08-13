// GET / POST /api/admin/notif-settings — admin notification settings
import { withErrorHandler, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getNotifSettings, updateNotifSettings } from "@/lib/repository";

export const runtime = "nodejs";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  return ok(await getNotifSettings());
});

export const POST = withErrorHandler(async (req: Request) => {
  await requireAdmin();
  const body = await req.json().catch(() => ({}));
  const bool = (k: string) => (body[k] === undefined ? undefined : body[k] ? 1 : 0);
  await updateNotifSettings({
    global_enabled: bool("global_enabled"),
    new_videos: bool("new_videos"),
    new_tools: bool("new_tools"),
    new_templates: bool("new_templates"),
    new_updates: bool("new_updates"),
    announcements: bool("announcements"),
    sound: bool("sound"),
    default_icon: body.default_icon,
    default_url: body.default_url,
  });
  return ok({ ok: true });
});

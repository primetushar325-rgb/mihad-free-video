// GET / POST /api/admin/notifications — admin notification center
import { withErrorHandler, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import {
  listNotifications,
  createNotification,
  listPushSubs,
  notifExists,
  updateNotificationStatus,
} from "@/lib/repository";
import { isPushConfigured, setupWebPush, webpush, toSubscription, pushPayload } from "@/lib/push";

export const runtime = "nodejs";

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const list = await listNotifications(100);
  return ok(list);
});

export const POST = withErrorHandler(async (req: Request) => {
  await requireAdmin();
  const body = await req.json().catch(() => ({}));

  // Duplicate prevention
  if (body.eventId && (await notifExists(body.eventId))) {
    return ok({ ok: false, duplicate: true, message: "Already notified this event." });
  }

  const scheduled = body.scheduleAt && new Date(body.scheduleAt) > new Date();

  const id = await createNotification({
    title: body.title || "Notification",
    message: body.message || "",
    icon: body.icon || "",
    image: body.image || "",
    url: body.url || "/",
    target: body.target || "all",
    status: scheduled ? "scheduled" : "draft",
    eventId: body.eventId,
    scheduleAt: scheduled ? body.scheduleAt : null,
  });

  if (scheduled) {
    return ok({ ok: true, id, status: "scheduled", message: "Notification scheduled." });
  }

  const result = await sendToSubscribers(body);
  await updateNotificationStatus(id, result.sent ? "sent" : "failed", result.sentCount);
  return ok({ ok: true, id, ...result });
});

async function sendToSubscribers(n: {
  title: string;
  message: string;
  icon?: string;
  image?: string;
  url?: string;
  eventId?: string;
}) {
  if (!isPushConfigured() || !setupWebPush()) {
    return { sent: false, sentCount: 0, message: "Web Push not configured (VAPID keys missing)." };
  }
  const subs = await listPushSubs();
  const payload = pushPayload({
    title: n.title,
    message: n.message,
    icon: n.icon,
    image: n.image,
    url: n.url,
    eventId: n.eventId,
  });
  let sentCount = 0;
  await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(toSubscription(s), payload).then(() => sentCount++).catch(() => {})
    )
  );
  return { sent: true, sentCount, total: subs.length };
}

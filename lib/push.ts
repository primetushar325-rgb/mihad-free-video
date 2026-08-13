// ============================================================
// Web Push helper — VAPID keys + send via web-push
// ============================================================
import webpush from "web-push";
import type { PushSubRow } from "@/lib/repository";

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  );
}

export function setupWebPush(): boolean {
  if (!isPushConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ||
      "mailto:admin@mihad-free-video.vercel.app",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  return true;
}

export { webpush };

export function toSubscription(s: PushSubRow) {
  return {
    endpoint: s.endpoint,
    keys: { p256dh: s.p256dh, auth: s.auth },
  };
}

export function pushPayload(input: {
  title: string;
  message: string;
  icon?: string;
  image?: string;
  url?: string;
  eventId?: string;
}) {
  return JSON.stringify({
    title: input.title,
    body: input.message,
    icon: input.icon || "/icons/icon-192.png",
    image: input.image || "",
    url: input.url || "/",
    tag: input.eventId || undefined,
  });
}

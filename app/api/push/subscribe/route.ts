// POST /api/push/subscribe — save a push subscription
import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { savePushSub } from "@/lib/repository";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ ok: true, fallback: true });
  }
  try {
    const body = await req.json().catch(() => ({}));
    await savePushSub({
      subscription: body.subscription,
      prefs: body.prefs,
      device: body.device ? JSON.stringify(body.device) : "",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: true, error: (e as Error).message });
  }
}

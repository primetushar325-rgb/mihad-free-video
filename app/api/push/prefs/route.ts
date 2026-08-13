// POST /api/push/prefs — update user notification preferences
import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { updatePushPrefs } from "@/lib/repository";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ ok: true, fallback: true });
  }
  try {
    const body = await req.json().catch(() => ({}));
    if (body.endpoint) {
      await updatePushPrefs(body.endpoint, body.prefs || {});
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: true, error: (e as Error).message });
  }
}

// GET /api/push/vapid-public — public VAPID key
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ key: process.env.VAPID_PUBLIC_KEY || "" });
}

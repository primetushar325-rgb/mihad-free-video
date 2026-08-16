import { NextResponse } from "next/server";
import { withErrorHandler, ok, badRequest, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import {
  countGiveawayParticipants,
  createGiveawayParticipant,
  getGiveawaySettings,
  updateGiveawaySettings,
} from "@/lib/repository";
import { sanitizeText, validateGiveaway } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, read-only configuration. Admin secrets are never part of this table.
export const GET = withErrorHandler(async () => {
  const giveaway = await getGiveawaySettings();
  return ok(giveaway);
});

// Admin-only configuration update.
export const PUT = withErrorHandler(async (req: Request) => {
  await requireAdmin();
  const { errors, value } = validateGiveaway(await readJson(req));
  if (Object.keys(errors).length) return badRequest("Validation failed.", errors);
  await updateGiveawaySettings(value);
  const giveaway = await getGiveawaySettings();
  return ok(
    { ...giveaway, participantCount: await countGiveawayParticipants(giveaway.giveawayVersion) },
    "Giveaway saved."
  );
});

// Privacy-minimal participation: stable anonymous browser id + name; email optional.
export const POST = withErrorHandler(async (req: Request) => {
  const body = (await readJson(req)) as Record<string, unknown>;
  const giveaway = await getGiveawaySettings();
  const now = Date.now();
  if (!giveaway.enabled || !giveaway.endTime || now >= Date.parse(giveaway.endTime))
    return badRequest("This giveaway has ended or is unavailable.");
  if (giveaway.startTime && now < Date.parse(giveaway.startTime))
    return badRequest("This giveaway has not started yet.");

  const name = sanitizeText(String(body.name || ""), 100);
  const email = sanitizeText(String(body.email || ""), 200).toLowerCase();
  const visitorId = sanitizeText(String(body.visitorId || ""), 200);
  const facebookCompleted = body.facebookCompleted === true;
  const telegramCompleted = body.telegramCompleted === true;
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!visitorId) errors.visitorId = "Browser identity is required.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email or leave it blank.";
  if (!facebookCompleted || !telegramCompleted)
    errors.requirements = "Open both Facebook and Telegram links first.";
  if (Object.keys(errors).length) return badRequest("Please complete the requirements.", errors);

  try {
    const id = await createGiveawayParticipant({
      giveawayVersion: giveaway.giveawayVersion,
      visitorId,
      name,
      email,
      facebookCompleted,
      telegramCompleted,
    });
    return ok({ id }, "Participation confirmed!", 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/unique|constraint/i.test(message)) {
      return NextResponse.json(
        { success: false, message: "You have already participated in this giveaway." },
        { status: 409 }
      );
    }
    throw error;
  }
});

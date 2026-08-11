// POST /api/track/download — public, no auth. Records a download.
// Called when the visitor actually downloads a video (after the ad gate).

import { withErrorHandler, ok, readJson, badRequest } from "@/lib/api";
import { trackDownload } from "@/lib/repository";

export const runtime = "nodejs";

export const POST = withErrorHandler(async (req: Request) => {
  const body = (await readJson(req)) as {
    visitorId?: string;
    videoId?: number;
    videoTitle?: string;
  };
  if (!body || typeof body.videoId !== "number") {
    return badRequest("videoId is required");
  }
  const id = await trackDownload({
    visitorId: body.visitorId,
    videoId: body.videoId,
    videoTitle: body.videoTitle,
  });
  return ok({ id });
});

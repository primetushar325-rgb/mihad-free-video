// POST /api/track/visit — public, no auth. Records a page visit.
// Called by the browser VisitTracker on page load.

import { withErrorHandler, ok, readJson } from "@/lib/api";
import { trackVisit } from "@/lib/repository";

export const runtime = "nodejs";

export const POST = withErrorHandler(async (req: Request) => {
  const body = (await readJson(req)) as {
    visitorId?: string;
    pagePath?: string;
    referrer?: string;
  };
  const id = await trackVisit({
    visitorId: body?.visitorId,
    pagePath: body?.pagePath,
    referrer: body?.referrer,
  });
  return ok({ id });
});

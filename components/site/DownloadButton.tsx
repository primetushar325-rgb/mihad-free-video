"use client";

// ============================================================
// DownloadButton — gate the real download behind a single ad
// view.
//   1st click  -> opens the ad link (omg10.com/4/11550591) in a
//                 new tab. The real file is NOT downloaded yet.
//   2nd click  -> (after the visitor returns) opens the actual
//                 Google Drive file and downloads it.
// Each video only needs the ad shown once (tracked in
// localStorage), so visitors who already passed it get the file
// on the first click.
// ============================================================

import { useState } from "react";
import { Download } from "lucide-react";
import { sendDownloadEvent } from "./visitor";

// The ad link you gave — opens once before the download.
const AD_URL = "https://omg10.com/4/11550591";

// LocalStorage key prefix so each video tracks its own pass state.
const keyFor = (id: number) => `mhv_dl_ad_${id}`;

export default function DownloadButton({
  videoId,
  downloadUrl,
  videoTitle,
}: {
  videoId: number;
  downloadUrl: string;
  videoTitle?: string;
}) {
  const [wasClicked, setWasClicked] = useState<boolean | null>(null);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();

    // Work out whether the ad was already shown for this video.
    let alreadyPassed = wasClicked;
    if (alreadyPassed === null) {
      try {
        alreadyPassed = localStorage.getItem(keyFor(videoId)) === "1";
      } catch {
        alreadyPassed = false;
      }
    }

    if (!alreadyPassed) {
      // First visit: open the ad in a new tab, mark as passed,
      // but do NOT start the real download yet.
      try {
        localStorage.setItem(keyFor(videoId), "1");
      } catch {
        /* ignore private-mode storage errors */
      }
      setWasClicked(true);
      window.open(AD_URL, "_blank", "noopener,noreferrer");
      return;
    }

    // Second visit (back button): open the real download.
    window.open(downloadUrl, "_blank", "noopener,noreferrer");

    // Record the download for admin analytics (best-effort).
    sendDownloadEvent(videoId, videoTitle || "");
  }

  return (
    <a
      href="#"
      onClick={handleClick}
      className="btn-gold w-full sm:w-auto"
      aria-label="Download Video"
    >
      <Download className="h-5 w-5" /> Download Video
    </a>
  );
}

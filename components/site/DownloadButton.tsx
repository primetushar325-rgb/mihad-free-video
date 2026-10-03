"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { sendDownloadEvent } from "./visitor";

const AD_URL = "https://omg10.com/4/11550591";
const REQUIRED_ADS = 2;
const keyFor = (id: number) => `mhv_dl_ad_${id}`;
const memoryProgress = new Map<number, number>();
const trackedDownloads = new Set<number>();

function readProgress(videoId: number): number {
  let value = memoryProgress.get(videoId) ?? 0;
  try {
    const stored = Number.parseInt(localStorage.getItem(keyFor(videoId)) || "0", 10);
    if (Number.isFinite(stored)) value = stored;
  } catch { /* in-memory fallback for restricted storage */ }
  return Math.max(0, Math.min(REQUIRED_ADS, value));
}

function saveProgress(videoId: number, value: number) {
  memoryProgress.set(videoId, value);
  try { localStorage.setItem(keyFor(videoId), String(value)); } catch { /* fallback already saved */ }
}

export default function DownloadButton({ videoId, downloadUrl, videoTitle }: {
  videoId: number;
  downloadUrl: string;
  videoTitle?: string;
}) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);

  useEffect(() => {
    setProgress(readProgress(videoId));
    setReady(true);
  }, [videoId]);

  function openTab(url: string): boolean {
    const opened = window.open(url, "_blank");
    if (!opened) return false;
    try { opened.opener = null; } catch { /* cross-origin browser restriction */ }
    return true;
  }

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (busy.current || !ready) return;
    busy.current = true;
    setError("");

    const current = readProgress(videoId);
    if (current < REQUIRED_ADS) {
      if (!openTab(AD_URL)) {
        setError("Your browser blocked the ad tab. Please allow pop-ups and try again.");
      } else {
        const next = current + 1;
        saveProgress(videoId, next);
        setProgress(next);
      }
    } else if (!openTab(downloadUrl)) {
      setError("Your browser blocked the download tab. Please allow pop-ups and try again.");
    } else if (!trackedDownloads.has(videoId)) {
      trackedDownloads.add(videoId);
      sendDownloadEvent(videoId, videoTitle || "");
    }

    window.setTimeout(() => { busy.current = false; }, 350);
  }

  const isDownload = progress >= REQUIRED_ADS;
  const label = isDownload ? "Download Video" : `Watch Ad (${progress + 1}/${REQUIRED_ADS})`;

  return (
    <div className="w-full sm:w-auto">
      <a
        href={isDownload ? downloadUrl : AD_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-disabled={!ready}
        className={`btn-gold w-full sm:w-auto ${!ready ? "pointer-events-none opacity-60" : ""}`}
        aria-label={label}
      >
        {isDownload ? <Download className="h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}
        {ready ? label : "Loading…"}
      </a>
      {error && <p role="alert" className="mt-2 max-w-sm text-xs text-red-400">{error}</p>}
      {!isDownload && ready && <p className="mt-2 text-xs text-neutral-400">Open {REQUIRED_ADS - progress} more ad {REQUIRED_ADS - progress === 1 ? "tab" : "tabs"} to unlock the download.</p>}
    </div>
  );
}

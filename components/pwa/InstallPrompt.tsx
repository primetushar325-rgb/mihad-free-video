"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Globe2, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const APK_URL = "/downloads/Mihad-Video.apk";
const DISMISS_KEY = "mihad_android_banner_dismissed_until";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export default function InstallPrompt() {
  const [webInstall, setWebInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [apkStarted, setApkStarted] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    const mobile = matchMedia("(max-width: 767px)").matches && /Android|Mobile/i.test(navigator.userAgent);
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (!mobile || dismissedUntil > Date.now()) return;

    setVisible(true);
    // Keep optional web-app installation separate from the APK action.
    const onWebInstallAvailable = (event: Event) => {
      event.preventDefault();
      setWebInstall(event as BeforeInstallPromptEvent);
    };
    addEventListener("beforeinstallprompt", onWebInstallAvailable);
    return () => removeEventListener("beforeinstallprompt", onWebInstallAvailable);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now() + WEEK));
  }

  async function installWebApp() {
    if (!webInstall) return;
    await webInstall.prompt();
    await webInstall.userChoice;
    setWebInstall(null);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="glass-strong fixed inset-x-3 top-[calc(.75rem+env(safe-area-inset-top))] z-[70] mx-auto max-w-md rounded-3xl border border-gold-500/30 p-3 shadow-gold"
          aria-label="Download Mihad Free Video Android app"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-gradient text-black">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">📱 Mihad Free Video</p>
              <p className="text-xs text-neutral-400">Install our Android app for a faster experience</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gold-300">Android App • APK</p>
            </div>
            <a
              href={APK_URL}
              download="Mihad-Video.apk"
              onClick={() => setApkStarted(true)}
              className="btn-gold px-3 py-2 text-xs"
              aria-label="Download Mihad Video APK"
            >
              <Download className="h-4 w-4" /> INSTALL
            </a>
            <button onClick={dismiss} className="p-1 text-neutral-500 hover:text-white" aria-label="Dismiss Android app banner">
              <X className="h-5 w-5" />
            </button>
          </div>

          {apkStarted && (
            <p className="mt-3 rounded-2xl bg-white/5 p-3 text-xs leading-relaxed text-neutral-300" aria-live="polite">
              APK download শুরু হয়েছে। Download শেষ হলে <b className="text-white">Mihad-Video.apk</b> খুলে Android-এর installation confirmation অনুসরণ করুন।
            </p>
          )}

          {webInstall && (
            <button onClick={installWebApp} className="mt-2 flex w-full items-center justify-center gap-1.5 py-1 text-[11px] text-neutral-500 hover:text-neutral-300">
              <Globe2 className="h-3.5 w-3.5" /> Install Web App instead
            </button>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

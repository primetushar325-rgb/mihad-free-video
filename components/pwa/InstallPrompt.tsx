"use client";

// ============================================================
// InstallPrompt — "Add to Home Screen" banner.
// Shows when the browser fires beforeinstallprompt, hidden once
// dismissed or installed.
// ============================================================

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { useSettings } from "@/components/SettingsProvider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "mihad_install_dismissed";

export default function InstallPrompt() {
  const settings = useSettings();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!settings.enablePwa) return;

    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const installed = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, [settings.enablePwa]);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="glass-strong fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-center gap-3 rounded-3xl border border-gold-500/30 p-3 shadow-gold safe-bottom"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-gradient text-black">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              Install Mihad Free Video
            </p>
            <p className="text-xs text-neutral-400">
              Add to your home screen for a faster, app-like experience.
            </p>
          </div>
          <button onClick={install} className="btn-gold px-3 py-2 text-sm">
            Install
          </button>
          <button
            onClick={dismiss}
            className="text-neutral-500 hover:text-neutral-200"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

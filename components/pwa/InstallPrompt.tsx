"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Smartphone, X } from "lucide-react";
import { useSettings } from "@/components/SettingsProvider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
const DISMISS_KEY = "mihad_install_dismissed_until";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export default function InstallPrompt() {
  const settings = useSettings();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [instructions, setInstructions] = useState(false);

  useEffect(() => {
    if (!settings.enablePwa || location.pathname.startsWith("/admin")) return;
    const standalone = matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const mobile = matchMedia("(max-width: 767px)").matches && /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (standalone || !mobile || dismissedUntil > Date.now()) return;

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const installed = () => { setVisible(false); localStorage.removeItem(DISMISS_KEY); };
    addEventListener("beforeinstallprompt", handler);
    addEventListener("appinstalled", installed);
    // Safari and browsers without beforeinstallprompt still get useful instructions.
    const fallback = window.setTimeout(() => setVisible(true), 2200);
    return () => {
      clearTimeout(fallback);
      removeEventListener("beforeinstallprompt", handler);
      removeEventListener("appinstalled", installed);
    };
  }, [settings.enablePwa]);

  async function install() {
    if (!deferred) { setInstructions(true); return; }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setDeferred(null);
  }
  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now() + WEEK));
  }

  return <AnimatePresence>{visible && <motion.aside
    initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
    transition={{ type: "spring", stiffness: 260, damping: 26 }}
    className="glass-strong fixed inset-x-3 top-[calc(.75rem+env(safe-area-inset-top))] z-[70] mx-auto max-w-md rounded-3xl border border-gold-500/30 p-3 shadow-gold"
    aria-label="Install Mihad Free Video app">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-gradient text-black"><Smartphone className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">📱 Mihad Free Video</p><p className="text-xs text-neutral-400">Install the app for a faster experience</p></div>
      <button onClick={install} className="btn-gold px-3 py-2 text-xs"><Download className="h-4 w-4" /> INSTALL</button>
      <button onClick={dismiss} className="p-1 text-neutral-500 hover:text-white" aria-label="Dismiss install banner"><X className="h-5 w-5" /></button>
    </div>
    {instructions && <div className="mt-3 rounded-2xl bg-white/5 p-3 text-xs leading-relaxed text-neutral-300">Browser menu <b className="text-white">⋮ / Share</b> খুলে <b className="text-gold-300">Install app</b> বা <b className="text-gold-300">Add to Home Screen</b> নির্বাচন করুন।</div>}
  </motion.aside>}</AnimatePresence>;
}

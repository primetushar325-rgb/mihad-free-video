"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Globe2, Smartphone, X } from "lucide-react";
import { usePlatformSettings } from "@/components/PlatformSettingsProvider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
const DISMISS_KEY = "mihad_android_banner_dismissed_until";
const INSTALLED_KEY = "mihad_app_installed";
const WEEK = 604800000;

export default function InstallPrompt() {
  const settings = usePlatformSettings();
  const [webInstall, setWebInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setWebInstall(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "1");
      setVisible(false);
    };
    addEventListener("beforeinstallprompt", onPrompt);
    addEventListener("appinstalled", onInstalled);
    return () => {
      removeEventListener("beforeinstallprompt", onPrompt);
      removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!settings?.installBannerEnabled || location.pathname.startsWith("/admin")) return;
    let active = true;
    const standalone = matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone) ||
      document.referrer.startsWith("android-app://");
    if (standalone) {
      localStorage.setItem(INSTALLED_KEY, "1");
      return;
    }
    const mobile = matchMedia("(max-width: 767px)").matches && /Android|Mobile/i.test(navigator.userAgent);
    if (!mobile || Number(localStorage.getItem(DISMISS_KEY) || 0) > Date.now()) return;
    (async () => {
      let installed = localStorage.getItem(INSTALLED_KEY) === "1";
      const getApps = (navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> }).getInstalledRelatedApps;
      if (getApps) {
        try {
          const apps = await getApps.call(navigator);
          installed = apps.length > 0;
          if (!installed) localStorage.removeItem(INSTALLED_KEY);
        } catch {}
      }
      if (active && !installed) setVisible(true);
    })();
    return () => { active = false; };
  }, [settings?.installBannerEnabled]);

  if (!settings) return null;
  async function installPwa() {
    if (!webInstall) return;
    await webInstall.prompt();
    const choice = await webInstall.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "1");
      setVisible(false);
    }
    setWebInstall(null);
  }

  return <AnimatePresence>{visible && <motion.aside initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="glass-strong fixed inset-x-3 top-[calc(.75rem+env(safe-area-inset-top))] z-[70] mx-auto max-w-md touch-pan-y rounded-3xl border border-gold-500/30 p-3 shadow-gold" aria-label="Download Mihad Free Video Android app"><div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-gradient text-black"><Smartphone className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">📱 {settings.installTitle}</p><p className="text-xs text-neutral-400">{settings.installText}</p><p className="text-[10px] uppercase text-gold-300">Android App • APK</p></div><a href={settings.apkUrl} download onClick={() => setStarted(true)} className="btn-gold touch-manipulation px-3 py-2 text-xs"><Download className="h-4 w-4" />INSTALL</a><button onClick={() => { setVisible(false); localStorage.setItem(DISMISS_KEY, String(Date.now() + WEEK)); }} aria-label="Dismiss" className="touch-manipulation text-neutral-500"><X /></button></div>{started && <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-neutral-300">APK download শুরু হয়েছে। Download শেষ হলে file খুলে Android installation confirmation অনুসরণ করুন।</p>}{settings.webInstallEnabled && webInstall && <button onClick={installPwa} className="mt-2 flex w-full touch-manipulation items-center justify-center gap-1 text-[11px] text-neutral-500"><Globe2 className="h-3.5 w-3.5" />Install Web App instead</button>}</motion.aside>}</AnimatePresence>;
}

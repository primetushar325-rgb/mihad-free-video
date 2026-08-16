"use client";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { usePlatformSettings } from "@/components/PlatformSettingsProvider";

export default function TelegramFloatingButton() {
  const settings = usePlatformSettings();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!settings?.telegramEnabled) return;
    const timer = window.setTimeout(() => setShow(true), settings.telegramDelay || 0);
    return () => window.clearTimeout(timer);
  }, [settings?.telegramDelay, settings?.telegramEnabled]);
  if (!settings?.telegramEnabled || !settings.telegramUrl || !show) return null;
  const side = settings.telegramPosition === "bottom-right" ? "right-4" : "left-4";
  return <a href={settings.telegramUrl} target="_blank" rel="noopener noreferrer" className={`pointer-events-auto fixed bottom-[calc(10.5rem+env(safe-area-inset-bottom))] ${side} z-40 flex max-w-[220px] touch-manipulation items-center gap-2 rounded-full border border-sky-300/40 bg-gradient-to-r from-sky-600 to-blue-700 px-3 py-2.5 text-xs font-bold text-white shadow-xl md:bottom-28 ${settings.telegramAnimation ? "telegram-pulse" : ""}`} aria-label={settings.telegramText}><span>{settings.telegramIcon || <Send className="h-4 w-4" />}</span><span className="line-clamp-2">{settings.telegramText}</span></a>;
}

"use client";

// ============================================================
// NotificationSystem — Web Push permission UX + user settings.
// Reuses the existing PWA setup (ServiceWorkerRegister registers
// /sw.js). Shows a non-aggressive "Stay Updated" prompt, then a
// bell for per-category settings.
// ============================================================

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, X } from "lucide-react";

const NOTIF_DONE_KEY = "mihad_notif_done";
const PREFS_KEY = "mihad_notif_prefs";

function lsGet(k: string, d: unknown) {
  try {
    const v = localStorage.getItem(k);
    return v === null ? d : JSON.parse(v);
  } catch {
    return d;
  }
}
function lsSet(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

export default function NotificationSystem() {
  const [promptVisible, setPromptVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [prefs, setPrefs] = useState({
    global: true, videos: true, tools: true, templates: true, updates: true, announcements: true,
  });

  function supported() {
    return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  }

  useEffect(() => {
    if (!supported()) return;
    if (lsGet(NOTIF_DONE_KEY, false)) {
      setSubscribed(Notification.permission === "granted");
      return;
    }
    if (Notification.permission === "granted") {
      setSubscribed(true);
      lsSet(NOTIF_DONE_KEY, true);
      return;
    }
    if (Notification.permission === "denied") {
      lsSet(NOTIF_DONE_KEY, true);
      return;
    }
    // default -> show prompt after a delay
    const t = setTimeout(() => setPromptVisible(true), 2500);
    return () => clearTimeout(t);
  }, []);

  async function subscribePush() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const keyRes = await fetch("/api/push/vapid-public");
      const { key } = await keyRes.json();
      if (!key) return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          prefs,
          device: { ua: navigator.userAgent },
        }),
      });
      setSubscribed(true);
    } catch {
      /* never break */
    }
  }

  async function allow() {
    lsSet(NOTIF_DONE_KEY, true);
    setPromptVisible(false);
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") subscribePush();
    } catch {}
  }
  function later() {
    lsSet(NOTIF_DONE_KEY, true);
    setPromptVisible(false);
  }

  function savePrefs() {
    lsSet(PREFS_KEY, prefs);
    setSettingsOpen(false);
  }

  return (
    <>
      {/* Stay Updated prompt */}
      <AnimatePresence>
        {promptVisible && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="glass-strong fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-3xl border border-gold-500/30 p-4 text-center shadow-gold safe-bottom"
          >
            <div className="text-3xl">🔔</div>
            <h3 className="mt-1 text-base font-bold text-white">Stay Updated</h3>
            <p className="mt-1 text-xs text-neutral-400">
              Get notifications about new videos, tools, updates and announcements.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <button onClick={allow} className="btn-gold w-full py-2.5 text-sm">
                Allow Notifications
              </button>
              <button onClick={later} className="w-full py-1.5 text-xs text-neutral-500 hover:text-neutral-200">
                Not Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bell (notification settings) — shown once subscribed or always as a toggle */}
      {subscribed && (
        <button
          onClick={() => setSettingsOpen(true)}
          className="glass fixed bottom-20 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-gold-500/30 text-gold-300"
          aria-label="Notification settings"
          title="Notification settings"
        >
          <Bell className="h-5 w-5" />
        </button>
      )}

      {/* Settings modal */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-strong w-full max-w-sm rounded-3xl border border-gold-500/30 p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">Notification Settings</h3>
                <button onClick={() => setSettingsOpen(false)} className="text-neutral-500 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {([
                  ["global", "Notifications"],
                  ["videos", "New Videos"],
                  ["tools", "New Tools"],
                  ["templates", "Templates"],
                  ["updates", "Updates"],
                  ["announcements", "Announcements"],
                ] as const).map(([k, label]) => (
                  <label key={k} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-sm">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={!!prefs[k]}
                      onChange={(e) => setPrefs({ ...prefs, [k]: e.target.checked })}
                      className="h-5 w-5 accent-[#f5a623]"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={savePrefs} className="btn-gold flex-1 py-2.5 text-sm">
                  Save Preferences
                </button>
                {subscribed && (
                  <button
                    onClick={async () => {
                      try {
                        const reg = await navigator.serviceWorker.ready;
                        const sub = await reg.pushManager.getSubscription();
                        if (sub) await sub.unsubscribe();
                      } catch {}
                      setSubscribed(false);
                      setSettingsOpen(false);
                    }}
                    className="rounded-2xl border border-white/15 px-3 py-2.5 text-sm text-neutral-400 hover:text-white"
                    title="Unsubscribe"
                  >
                    <BellOff className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out.buffer;
}

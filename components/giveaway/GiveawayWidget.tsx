"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Facebook, Gift, Send, X, Youtube } from "lucide-react";
import { getVisitorId } from "@/components/site/visitor";
import type { GiveawaySettings } from "@/types";
import { useScrollLock } from "@/components/useScrollLock";

function remaining(endTime: string | null) {
  const ms = endTime ? Math.max(0, Date.parse(endTime) - Date.now()) : 0;
  return {
    total: ms,
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}
const pad = (n: number) => String(n).padStart(2, "0");

export default function GiveawayWidget() {
  const [config, setConfig] = useState<GiveawaySettings | null>(null);
  const [time, setTime] = useState(() => remaining(null));
  const [open, setOpen] = useState(false);
  const [facebookDone, setFacebookDone] = useState(false);
  const [telegramDone, setTelegramDone] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    fetch("/api/giveaway", { cache: "no-store" })
      .then((r) => r.json())
      .then((r) => r.success && setConfig(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!config?.endTime) return;
    const tick = () => setTime(remaining(config.endTime));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [config?.endTime]);

  const close = useCallback(() => {
    setOpen(false);
    if (history.state?.giveawayModal) history.back();
  }, []);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onPop = () => setOpen(false);
    addEventListener("keydown", onKey);
    addEventListener("popstate", onPop);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("popstate", onPop);
    };
  }, [open, close]);

  function showModal() {
    history.pushState({ giveawayModal: true }, "");
    setOpen(true);
  }

  async function participate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!facebookDone || !telegramDone) {
      setMessage("Facebook ও Telegram—দুটি link-ই আগে open করুন।");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/giveaway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: getVisitorId(), name, email,
          facebookCompleted: facebookDone, telegramCompleted: telegramDone,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Participation failed.");
      setSuccess(true);
      setMessage(json.message || "Participation confirmed!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSending(false);
    }
  }

  const active = useMemo(() => {
    if (!config?.enabled || !config.endTime || time.total <= 0) return false;
    return !config.startTime || Date.now() >= Date.parse(config.startTime);
  }, [config, time.total]);

  if (!config?.enabled || !config.floatingButtonEnabled) return null;
  const side = config.buttonPosition === "bottom-left" ? "left-4" : "right-4";

  return (
    <>
      <div className={`fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] md:bottom-4 ${side} z-40 flex pointer-events-none flex-col items-center gap-1.5`}>
        <div className="rounded-full border border-white/10 bg-black/85 px-2.5 py-1 font-mono text-[10px] font-bold text-white shadow-xl backdrop-blur">
          {time.total > 0 ? `${pad(time.days)}d ${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}` : "GIVEAWAY ENDED"}
        </div>
        <motion.button
          type="button" onClick={showModal} whileTap={{ scale: 0.92 }}
          className="pointer-events-auto relative flex h-16 w-16 touch-manipulation items-center justify-center rounded-[22px] border border-amber-200/60 bg-gradient-to-br from-yellow-300 via-amber-500 to-red-600 text-black shadow-[0_12px_35px_rgba(245,166,35,.45)]"
          aria-label="Open giveaway"
        >
          <Gift className="h-9 w-9" strokeWidth={2.2} />
          <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white ring-2 ring-white">
            <Youtube className="h-4 w-4" fill="currentColor" />
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && close()}>
            <motion.section role="dialog" aria-modal="true" aria-labelledby="giveaway-title"
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              className="glass-strong max-h-[92dvh] w-full max-w-md touch-pan-y overflow-y-auto overscroll-contain rounded-t-[30px] border border-amber-400/30 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[30px]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-gradient text-2xl">🎁</span>
                  <div><h2 id="giveaway-title" className="font-display text-lg font-extrabold text-white">{config.title}</h2>
                    <a href={config.youtubeUrl || undefined} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-red-400">
                      <Youtube className="h-4 w-4" /> {config.subscriberCount.toLocaleString()} Subscribers
                    </a></div>
                </div>
                <button onClick={close} className="rounded-full bg-white/5 p-2 text-neutral-400" aria-label="Close giveaway"><X className="h-5 w-5" /></button>
              </div>

              <div className="my-4 rounded-2xl bg-gradient-to-r from-red-600/20 to-amber-500/10 p-4 text-center">
                <p className="font-display text-xl font-black text-white">{config.description || "Win a YouTube Channel!"}</p>
                <p className="mt-1 text-xs text-neutral-400">Giveaway-তে participate করতে requirements complete করুন</p>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center">
                {[[time.days,"Days"],[time.hours,"Hours"],[time.minutes,"Minutes"],[time.seconds,"Seconds"]].map(([value,label]) =>
                  <div key={label} className="rounded-xl border border-white/8 bg-white/5 px-1 py-2"><b className="block font-mono text-lg text-gold-300">{pad(Number(value))}</b><span className="text-[9px] uppercase text-neutral-500">{label}</span></div>)}
              </div>
              {!active && <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-center text-sm font-bold text-red-300">{time.total <= 0 ? "🎉 GIVEAWAY ENDED" : "Giveaway has not started yet"}</p>}

              <div className="mt-4 space-y-2.5">
                <Requirement href={config.facebookUrl} done={facebookDone} onOpen={() => setFacebookDone(true)} icon={<Facebook className="h-5 w-5" fill="currentColor" />} label="Follow us on Facebook" action="FOLLOW FACEBOOK" color="bg-blue-600" />
                <Requirement href={config.telegramUrl} done={telegramDone} onOpen={() => setTelegramDone(true)} icon={<Send className="h-5 w-5" fill="currentColor" />} label="Join our Telegram Channel" action="JOIN TELEGRAM" color="bg-sky-500" />
              </div>

              <form onSubmit={participate} className="mt-4 space-y-2.5">
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} autoComplete="name" placeholder="Your name *" disabled={!active || success} />
                <input className="field" value={email} onChange={(e) => setEmail(e.target.value)} type="email" maxLength={200} autoComplete="email" placeholder="Email (optional)" disabled={!active || success} />
                <p className="px-1 text-[10px] leading-relaxed text-neutral-500">Duplicate entry ঠেকাতে anonymous browser ID সংরক্ষণ করা হবে। Email optional.</p>
                <button disabled={!active || !facebookDone || !telegramDone || sending || success} className="btn-gold w-full py-3.5">
                  {success ? <><Check className="h-5 w-5" /> PARTICIPATION CONFIRMED</> : sending ? "SUBMITTING…" : "PARTICIPATE NOW"}
                </button>
                {message && <p aria-live="polite" className={`text-center text-xs ${success ? "text-emerald-400" : "text-red-400"}`}>{message}</p>}
              </form>
              <button onClick={close} className="mt-3 w-full py-2 text-sm text-neutral-400">Close</button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Requirement({ href, done, onOpen, icon, label, action, color }: {
  href: string; done: boolean; onOpen: () => void; icon: React.ReactNode; label: string; action: string; color: string;
}) {
  return <div className="rounded-2xl border border-white/8 bg-white/[.035] p-3">
    <div className="mb-2 flex items-center gap-2 text-sm text-white">{icon}<span className="flex-1">{label}</span>{done && <Check className="h-4 w-4 text-emerald-400" />}</div>
    <a href={href || undefined} target="_blank" rel="noopener noreferrer" onClick={(e) => { if (!href) e.preventDefault(); else onOpen(); }} className={`flex min-h-11 items-center justify-center rounded-xl text-xs font-black text-white ${href ? color : "cursor-not-allowed bg-neutral-700"}`}>{action}</a>
  </div>;
}

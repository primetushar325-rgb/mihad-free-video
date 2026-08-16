"use client";

import { useEffect, useMemo, useState } from "react";
import { Facebook, Gift, Loader2, Save, Send, Youtube } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import Loader from "@/components/admin/Loader";
import PageHeader from "@/components/admin/PageHeader";
import type { GiveawaySettings } from "@/types";

const localDate = (iso: string | null) => iso ? new Date(iso).toISOString().slice(0, 16) : "";

export default function GiveawayManager() {
  const { toast } = useToast();
  const [form, setForm] = useState<GiveawaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    api.get<GiveawaySettings>("/api/giveaway")
      .then(setForm).catch((e: ApiError) => toast.error(e.message || "Failed to load giveaway"))
      .finally(() => setLoading(false));
  }, [toast]);

  const computedDurationEnd = useMemo(() => {
    const seconds = duration.days * 86400 + duration.hours * 3600 + duration.minutes * 60 + duration.seconds;
    return seconds > 0 ? new Date(Date.now() + seconds * 1000).toISOString() : null;
  }, [duration]);

  function set<K extends keyof GiveawaySettings>(key: K, value: GiveawaySettings[K]) {
    if (form) setForm({ ...form, [key]: value });
  }

  async function save(e?: React.FormEvent, override?: Partial<GiveawaySettings>) {
    e?.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const payload = { ...form, ...override };
      if (computedDurationEnd) {
        payload.startTime = new Date().toISOString();
        payload.endTime = computedDurationEnd;
      }
      const result = await api.put<GiveawaySettings & { participantCount?: number }>("/api/giveaway", payload);
      setForm(result);
      setDuration({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      toast.success(override?.enabled === false ? "Giveaway disabled" : "Giveaway saved");
    } catch (err) {
      toast.error((err as ApiError).message || "Save failed");
    } finally { setSaving(false); }
  }

  if (loading) return <Loader label="Loading giveaway…" />;
  if (!form) return <div className="card text-center text-neutral-400">Giveaway settings unavailable. Apply migration 0003 first.</div>;

  return <div>
    <PageHeader title="Giveaway Management" subtitle="Control the public YouTube giveaway, countdown and participation flow" />
    <form onSubmit={(e) => save(e)} className="space-y-5">
      <section className="card grid gap-4 sm:grid-cols-2">
        <Toggle label="Enable Giveaway" checked={form.enabled} onChange={(v) => set("enabled", v)} />
        <Toggle label="Floating Button" checked={form.floatingButtonEnabled} onChange={(v) => set("floatingButtonEnabled", v)} />
        <Field label="Giveaway Title"><input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} required /></Field>
        <Field label="Subscriber Count"><input className="field" type="number" min="0" value={form.subscriberCount} onChange={(e) => set("subscriberCount", Number(e.target.value))} required /></Field>
        <Field label="YouTube Channel Link"><input className="field" type="url" value={form.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/@channel" /></Field>
        <Field label="Facebook Link"><input className="field" type="url" value={form.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/..." /></Field>
        <Field label="Telegram Link"><input className="field" type="url" value={form.telegramUrl} onChange={(e) => set("telegramUrl", e.target.value)} placeholder="https://t.me/..." /></Field>
        <Field label="Button Position"><select className="field" value={form.buttonPosition} onChange={(e) => set("buttonPosition", e.target.value as GiveawaySettings["buttonPosition"])}><option value="bottom-right">Bottom right</option><option value="bottom-left">Bottom left</option></select></Field>
        <Field label="Giveaway Description" className="sm:col-span-2"><textarea className="field min-h-24" value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
      </section>

      <section className="card">
        <h2 className="mb-1 font-display font-bold text-white">Giveaway Timer</h2>
        <p className="mb-4 text-xs text-neutral-500">Set an exact end time, or enter a duration. A duration overrides the exact time when saved.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start Time"><input className="field" type="datetime-local" value={localDate(form.startTime)} onChange={(e) => set("startTime", e.target.value ? new Date(e.target.value).toISOString() : null)} /></Field>
          <Field label="End Time"><input className="field" type="datetime-local" value={localDate(form.endTime)} onChange={(e) => set("endTime", e.target.value ? new Date(e.target.value).toISOString() : null)} /></Field>
        </div>
        <div className="my-4 flex items-center gap-3 text-xs text-neutral-500"><span className="h-px flex-1 bg-white/10" />OR DURATION<span className="h-px flex-1 bg-white/10" /></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["days","hours","minutes","seconds"] as const).map((key) => <Field key={key} label={key}><input className="field" type="number" min="0" value={duration[key]} onChange={(e) => setDuration({ ...duration, [key]: Math.max(0, Number(e.target.value)) })} /></Field>)}
        </div>
        {computedDurationEnd && <p className="mt-3 text-xs text-gold-300">Duration ends: {new Date(computedDurationEnd).toLocaleString()}</p>}
      </section>

      <AdminPreview config={form} endTime={computedDurationEnd || form.endTime} />

      <div className="sticky bottom-4 z-10 flex flex-col gap-2 sm:flex-row">
        <button type="submit" disabled={saving} className="btn-gold flex-1 sm:flex-none">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} SAVE GIVEAWAY</button>
        <button type="button" disabled={saving} onClick={() => save(undefined, { enabled: false })} className="btn-danger">DISABLE GIVEAWAY</button>
      </div>
    </form>
  </div>;
}

function AdminPreview({ config, endTime }: { config: GiveawaySettings; endTime: string | null }) {
  const end = endTime ? Date.parse(endTime) : 0;
  const total = Math.max(0, end - Date.now());
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor(total / 60000) % 60;
  const seconds = Math.floor(total / 1000) % 60;
  return <section className="card overflow-hidden">
    <h2 className="mb-4 font-display font-bold text-white">Live Preview</h2>
    <div className="relative mx-auto min-h-[390px] max-w-sm overflow-hidden rounded-[28px] border border-white/10 bg-black p-4">
      <div className="mx-auto rounded-3xl border border-amber-400/25 bg-neutral-950 p-4 shadow-2xl">
        <div className="flex gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-gradient text-xl">🎁</span><div><b className="text-sm text-white">{config.title}</b><p className="flex items-center gap-1 text-xs font-bold text-red-400"><Youtube className="h-3.5 w-3.5" />{config.subscriberCount.toLocaleString()} Subscribers</p></div></div>
        <p className="my-4 rounded-xl bg-red-500/10 p-3 text-center font-bold text-white">{config.description}</p>
        <div className="space-y-2"><div className="flex items-center gap-2 rounded-xl bg-blue-600 p-2.5 text-xs font-bold text-white"><Facebook className="h-4 w-4" /> FOLLOW FACEBOOK</div><div className="flex items-center gap-2 rounded-xl bg-sky-500 p-2.5 text-xs font-bold text-white"><Send className="h-4 w-4" /> JOIN TELEGRAM</div><div className="rounded-xl bg-gold-gradient p-3 text-center text-xs font-black text-black">PARTICIPATE NOW</div></div>
      </div>
      <div className={`absolute bottom-3 ${config.buttonPosition === "bottom-left" ? "left-3" : "right-3"} flex flex-col items-center`}><span className="mb-1 rounded-full bg-black px-2 py-1 font-mono text-[9px] text-white">{hours}:{String(minutes).padStart(2,"0")}:{String(seconds).padStart(2,"0")}</span><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-gradient"><Gift className="h-7 w-7" /></span></div>
    </div>
  </section>;
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <label className={className}><span className="label">{label}</span>{children}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) { return <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="text-sm text-white">{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[#f5a623]" /></label>; }

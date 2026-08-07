"use client";

// ============================================================
// AdsManager — edit AdSense codes for each slot + publisher client id.
// ============================================================

import { useEffect, useState } from "react";
import { Save, Loader2, Megaphone } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/admin/PageHeader";
import Loader from "@/components/admin/Loader";
import type { Settings } from "@/types";

const SLOTS: {
  key: keyof Pick<
    Settings,
    "adsenseHeader" | "adsenseBetweenCards" | "adsenseDetails" | "adsenseFooter"
  >;
  label: string;
  hint: string;
}[] = [
  { key: "adsenseHeader", label: "Header Banner", hint: "Shown at the top of every page." },
  { key: "adsenseBetweenCards", label: "Between Video Cards", hint: "Injected inside the video grid." },
  { key: "adsenseDetails", label: "Video Details Page", hint: "Shown below the video info." },
  { key: "adsenseFooter", label: "Footer Banner", hint: "Shown in the site footer." },
];

export default function AdsManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setSettings(await api.get<Settings>("/api/settings"));
      } catch (err) {
        toast.error((err as ApiError).message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await api.put("/api/settings", {
        adsenseClient: settings.adsenseClient,
        adsenseHeader: settings.adsenseHeader,
        adsenseBetweenCards: settings.adsenseBetweenCards,
        adsenseDetails: settings.adsenseDetails,
        adsenseFooter: settings.adsenseFooter,
        enableAds: settings.enableAds,
      });
      toast.success("Ad settings saved");
    } catch (err) {
      toast.error((err as ApiError).message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading ad settings…" />;
  if (!settings)
    return <div className="card text-center text-neutral-400">No settings.</div>;

  return (
    <div>
      <PageHeader
        title="Ads"
        subtitle="Manage Google AdSense codes for each placement"
      />

      <form onSubmit={submit} className="space-y-5">
        {/* Master toggle */}
        <div className="card">
          <label className="flex cursor-pointer items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-300">
                <Megaphone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  Enable AdSense
                </p>
                <p className="text-xs text-neutral-500">
                  Master switch for all ad slots.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={settings.enableAds}
              onChange={(e) =>
                setSettings({ ...settings, enableAds: e.target.checked })
              }
            />
            <span
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                settings.enableAds ? "bg-gold-500" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                  settings.enableAds ? "left-[22px]" : "left-0.5"
                }`}
              />
            </span>
          </label>
        </div>

        {/* Publisher client */}
        <div className="card">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold-300">
            Publisher ID
          </h2>
          <label className="label">AdSense Client ID</label>
          <input
            className="field"
            value={settings.adsenseClient}
            onChange={(e) =>
              setSettings({ ...settings, adsenseClient: e.target.value })
            }
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
          />
          <p className="mt-2 text-xs text-neutral-500">
            Loads the AdSense library across your site. Get this from your
            AdSense dashboard.
          </p>
        </div>

        {/* Slots */}
        <div className="space-y-4">
          {SLOTS.map((slot) => (
            <div key={slot.key} className="card">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-white">
                    {slot.label}
                  </h3>
                  <p className="text-xs text-neutral-500">{slot.hint}</p>
                </div>
                <span
                  className={`badge ${
                    settings[slot.key]
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border border-white/10 bg-white/5 text-neutral-500"
                  }`}
                >
                  {settings[slot.key] ? "Configured" : "Empty"}
                </span>
              </div>
              <textarea
                className="field min-h-[100px] resize-y font-mono text-xs"
                value={settings[slot.key]}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    [slot.key]: e.target.value,
                  })
                }
                placeholder={`<!-- Paste your ${slot.label} AdSense unit code here -->`}
              />
            </div>
          ))}
        </div>

        <div className="sticky bottom-4 z-10">
          <button
            type="submit"
            disabled={saving}
            className="btn-gold w-full shadow-gold-lg sm:w-auto"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Ad Settings
              </>
              )}
          </button>
        </div>
      </form>
    </div>
  );
}

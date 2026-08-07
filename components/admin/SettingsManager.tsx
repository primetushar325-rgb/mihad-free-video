"use client";

// ============================================================
// SettingsManager — site identity, colors, PWA & ads toggles.
// ============================================================

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/admin/PageHeader";
import Loader from "@/components/admin/Loader";
import type { Settings } from "@/types";

export default function SettingsManager() {
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
      await api.put("/api/settings", settings);
      toast.success("Settings saved");
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading settings…" />;
  if (!settings)
    return <div className="card text-center text-neutral-400">No settings.</div>;

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings({ ...settings, [key]: value });

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Customize your site identity, theme and features"
      />

      <form onSubmit={submit} className="space-y-5">
        {/* Identity */}
        <Section title="Site Identity">
          <Field label="Website Name">
            <input
              className="field"
              value={settings.websiteName}
              onChange={(e) => set("websiteName", e.target.value)}
            />
          </Field>
          <Field label="Logo URL (optional)">
            <input
              className="field"
              value={settings.logoUrl}
              onChange={(e) => set("logoUrl", e.target.value)}
              placeholder="https://…/logo.png"
            />
          </Field>
          <Field label="Favicon URL (optional)">
            <input
              className="field"
              value={settings.faviconUrl}
              onChange={(e) => set("faviconUrl", e.target.value)}
              placeholder="https://…/favicon.ico"
            />
          </Field>
          <Field label="Footer Text" className="sm:col-span-2">
            <input
              className="field"
              value={settings.footerText}
              onChange={(e) => set("footerText", e.target.value)}
            />
          </Field>
        </Section>

        {/* Theme */}
        <Section title="Theme Colors">
          <Field label="Primary (Gold) Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-xl border border-white/10 bg-transparent"
              />
              <input
                className="field"
                value={settings.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
              />
            </div>
          </Field>
          <Field label="Secondary (Background) Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => set("secondaryColor", e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-xl border border-white/10 bg-transparent"
              />
              <input
                className="field"
                value={settings.secondaryColor}
                onChange={(e) => set("secondaryColor", e.target.value)}
              />
            </div>
          </Field>
        </Section>

        {/* Features */}
        <Section title="Features">
          <Toggle
            label="Enable PWA"
            description="Allow install to home screen & offline support."
            checked={settings.enablePwa}
            onChange={(v) => set("enablePwa", v)}
          />
          <Toggle
            label="Enable Ads"
            description="Show AdSense slots across the site."
            checked={settings.enableAds}
            onChange={(v) => set("enableAds", v)}
          />
        </Section>

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
                <Save className="h-4 w-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-gold-300">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-neutral-100">{label}</p>
        {description && (
          <p className="text-xs text-neutral-500">{description}</p>
        )}
      </div>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-gold-500" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </label>
  );
}

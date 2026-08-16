"use client";

// ============================================================
// NotificationsManager — admin Notification Center.
// Compose / send / schedule, history, and global settings.
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { Send, Clock, RotateCcw } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import PageHeader from "@/components/admin/PageHeader";
import Loader from "@/components/admin/Loader";

interface NotifRow {
  id: number;
  title: string;
  message: string;
  url: string;
  target: string;
  status: string;
  sent_count: number;
  event_id: string | null;
  created_at: string;
  sent_at: string | null;
}

export default function NotificationsManager() {
  const { toast } = useToast();
  const [history, setHistory] = useState<NotifRow[]>([]);
  const [settings, setSettings] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("/");
  const [target, setTarget] = useState("all");
  const [icon, setIcon] = useState("");
  const [image, setImage] = useState("");
  const [schedule, setSchedule] = useState("");

  const load = useCallback(async () => {
    try {
      const [h, s] = await Promise.all([
        api.get<NotifRow[]>("/api/admin/notifications"),
        api.get<Record<string, number>>("/api/admin/notif-settings"),
      ]);
      setHistory(h);
      setSettings(s);
    } catch (e) {
      toast.error((e as ApiError).message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function send(scheduleAt: string | null) {
    if (!title.trim()) { toast.error("Title is required"); return; }
    try {
      const res = await api.post<{ ok: boolean; duplicate?: boolean; message?: string }>(
        "/api/admin/notifications",
        { title, message, url: url || "/", target, icon, image, scheduleAt }
      );
      if (res.duplicate) { toast.error(res.message || "Duplicate"); return; }
      toast.success(res.message || "Notification sent");
      setTitle(""); setMessage(""); setUrl("/");
      load();
    } catch (e) {
      toast.error((e as ApiError).message || "Failed to send");
    }
  }

  function toggleSetting(key: string, value: boolean) {
    if (!settings) return;
    api.post("/api/admin/notif-settings", { [key]: value }).then(() => {
      setSettings({ ...settings, [key]: value ? 1 : 0 });
      toast.success("Saved");
    }).catch(() => toast.error("Failed to save"));
  }

  if (loading) return <Loader label="Loading notifications…" />;

  const settingRows: Array<[string, string]> = [
    ["global_enabled", "Global Notifications"],
    ["new_videos", "New Video Notifications"],
    ["new_tools", "New Tool Notifications"],
    ["new_templates", "New Template Notifications"],
    ["new_updates", "New Update Notifications"],
    ["announcements", "Admin Announcement Notifications"],
    ["sound", "Notification Sound"],
  ];

  return (
    <div>
      <PageHeader title="Notification Center" subtitle="Send, schedule and manage push notifications" />

      {/* Composer */}
      <div className="card mb-4">
        <h2 className="mb-3 font-display text-lg font-bold text-white">🔔 Send Notification</h2>
        <div className="space-y-3">
          <input className="field" placeholder="Notification title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="field" placeholder="Notification message" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field" placeholder="URL (e.g. /video/123)" value={url} onChange={(e) => setUrl(e.target.value)} />
            <select className="field" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="all">All Users</option>
              <option value="installed">Installed App Users</option>
              <option value="subscribed">Subscribed to notifications</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field" placeholder="Icon URL (optional)" value={icon} onChange={(e) => setIcon(e.target.value)} />
            <input className="field" placeholder="Image URL (optional)" value={image} onChange={(e) => setImage(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Clock className="h-4 w-4" /> Schedule (optional)
            </div>
            <input type="datetime-local" className="field max-w-[220px]" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button className="btn-gold px-4 py-2.5 text-sm" onClick={() => send(null)}>
              <Send className="h-4 w-4" /> Send Now
            </button>
            {schedule && (
              <button className="btn-ghost px-4 py-2.5 text-sm" onClick={() => send(schedule)}>
                <Clock className="h-4 w-4" /> Schedule
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">History</h2>
          <button onClick={load} className="text-sm text-neutral-400 hover:text-white" title="Refresh">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-neutral-400">No notifications sent yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((n) => (
              <div key={n.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-black/40 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{n.title}</p>
                  <p className="truncate text-xs text-neutral-400">{n.message}</p>
                </div>
                <span className="badge bg-white/5 text-neutral-300">{n.sent_count} sent</span>
                <span className={`badge ${n.status === "sent" ? "bg-emerald-500/15 text-emerald-300" : n.status === "scheduled" ? "bg-amber-500/15 text-amber-300" : "bg-red-500/15 text-red-300"}`}>
                  {n.status}
                </span>
                <span className="text-xs text-neutral-500">{n.sent_at || n.created_at}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="card">
        <h2 className="mb-3 font-display text-lg font-bold text-white">🔔 Notification Settings</h2>
        {settings && (
          <div className="space-y-2">
            {settingRows.map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/40 px-3 py-2.5 text-sm text-white">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={!!settings[key]}
                  onChange={(e) => toggleSetting(key, e.target.checked)}
                  className="h-5 w-5 accent-[#f5a623]"
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

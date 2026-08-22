"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Flame, Smartphone, Youtube, Newspaper } from "lucide-react";
import { usePlatformSettings } from "@/components/PlatformSettingsProvider";
const internal = [{ href: "/", label: "Home", Icon: Home }, { href: "/trending", label: "Trending", Icon: Flame }] as const;
export default function BottomNavigation() {
  const path = usePathname();
  const settings = usePlatformSettings();
  const [notice, setNotice] = useState("");
  function coming(label: string) { setNotice(`${label} — Coming Soon`); window.setTimeout(() => setNotice(""), 2200); }
  const end = [{ href: "/news", label: "News", Icon: Newspaper }] as const;
  return (
    <>
      {notice && <div role="status" className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-[60] -translate-x-1/2 rounded-full border border-gold-500/30 bg-black/90 px-4 py-2 text-xs font-semibold text-gold-300 shadow-xl">{notice}</div>}
      <nav aria-label="Primary mobile navigation" className="glass-strong pointer-events-auto fixed inset-x-2 bottom-[calc(.5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex touch-manipulation max-w-md items-center justify-around rounded-[24px] border border-gold-500/25 px-1 py-1.5 shadow-2xl md:hidden">
        {internal.map(i => <Internal key={i.href} {...i} active={i.href === "/" ? path === "/" : path.startsWith(i.href)} />)}
        <External label="Premium Apps" Icon={Smartphone} href={settings?.premiumAppsEnabled ? settings.premiumAppsUrl : ""} onComing={() => coming("Premium Apps")} />
        <External label="YouTube" Icon={Youtube} href={settings?.youtubeExternalEnabled ? settings.youtubeExternalUrl : ""} onComing={() => coming("YouTube")} />
        {end.map(i => <Internal key={i.href} {...i} active={path.startsWith(i.href)} />)}
      </nav>
    </>
  );
}
function Internal({ href, label, Icon, active }: { href: string; label: string; Icon: typeof Home; active: boolean }) {
  return (
    <Link href={href} data-active={active} className="relative z-10 flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[9px] font-semibold transition">
      <div className={`pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-[var(--gold)] shadow-gold flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(.68,-.55,.27,1.55)] ${active ? "scale-110 translate-y-[-20%] animate-[popBounce_.3s_ease-out]" : "scale-0 translate-y-0 opacity-0"}`}>
        <Icon className="h-5 w-5 text-black relative z-10" />
      </div>
      <Icon className={`h-5 w-5 relative z-10 transition ${active ? "text-black scale-110" : "text-neutral-400"}`} />
      <span className={`truncate relative z-10 ${active ? "text-black" : "text-neutral-400"}`}>{label}</span>
    </Link>
  );
}
function External({ label, Icon, href, onComing }: { label: string; Icon: typeof Home; href: string; onComing: () => void }) {
  const cls = "relative z-10 flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[9px] font-semibold text-neutral-400 transition hover:text-gold-300";
  if (href) return <a href={href} className={cls} rel="external"><Icon className="h-5 w-5" /><span className="truncate">{label}</span></a>;
  return <button type="button" onClick={onComing} className={cls} title={`${label} coming soon`}><Icon className="h-5 w-5" /><span className="truncate">{label}</span></button>;
}

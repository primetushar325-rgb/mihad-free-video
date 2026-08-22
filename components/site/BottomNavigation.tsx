"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Home, Flame, Smartphone, Youtube, Newspaper } from "lucide-react";
import { usePlatformSettings } from "@/components/PlatformSettingsProvider";
const internal = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/trending", label: "Trending", Icon: Flame },
] as const;
export default function BottomNavigation() {
  const path = usePathname();
  const settings = usePlatformSettings();
  const [notice, setNotice] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  function coming(label: string) {
    setNotice(`${label} — Coming Soon`);
    window.setTimeout(() => setNotice(""), 2200);
  }
  const end = [{ href: "/news", label: "News", Icon: Newspaper }] as const;
  useEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;
    const activeEl = nav.querySelector('[data-active="true"]') as HTMLElement | null;
    if (!activeEl) { indicator.style.opacity = "0"; return; }
    const navRect = nav.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    const x = itemRect.left - navRect.left + itemRect.width / 2 - indicator.offsetWidth / 2;
    const y = itemRect.top - navRect.top + itemRect.height / 2 - indicator.offsetHeight / 2;
    indicator.style.opacity = "1";
    indicator.style.transform = `translate(${x}px, ${y}px)`;
    indicator.style.borderRadius = "60% 40% 45% 55%";
    const t = setTimeout(() => { indicator.style.borderRadius = "50% 40% 55% 45%"; }, 350);
    return () => clearTimeout(t);
  }, [path]);
  return (
    <>
      {notice && (
        <div role="status" className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-[60] -translate-x-1/2 rounded-full border border-gold-500/30 bg-black/90 px-4 py-2 text-xs font-semibold text-gold-300 shadow-xl">{notice}</div>
      )}
      <nav ref={navRef} aria-label="Primary mobile navigation" className="glass-strong pointer-events-auto fixed inset-x-2 bottom-[calc(.5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex touch-manipulation max-w-md items-center justify-around rounded-[24px] border border-gold-500/25 px-1 py-1.5 shadow-2xl md:hidden">
        <div ref={indicatorRef} className="liquid-indicator" style={{ opacity: 0 }} />
        {internal.map((i) => (
          <Internal key={i.href} {...i} active={i.href === "/" ? path === "/" : path.startsWith(i.href)} />
        ))}
        <External label="Premium Apps" Icon={Smartphone} href={settings?.premiumAppsEnabled ? settings.premiumAppsUrl : ""} onComing={() => coming("Premium Apps")} />
        <External label="YouTube" Icon={Youtube} href={settings?.youtubeExternalEnabled ? settings.youtubeExternalUrl : ""} onComing={() => coming("YouTube")} />
        {end.map((i) => (
          <Internal key={i.href} {...i} active={path.startsWith(i.href)} />
        ))}
      </nav>
    </>
  );
}
function Internal({ href, label, Icon, active }: { href: string; label: string; Icon: typeof Home; active: boolean }) {
  return (
    <Link href={href} data-active={active} className={`relative z-10 flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[9px] font-semibold transition ${active ? "text-black shadow-gold scale-105" : "text-neutral-400"}`}>
      <Icon className="h-5 w-5" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
function External({ label, Icon, href, onComing }: { label: string; Icon: typeof Home; href: string; onComing: () => void }) {
  const cls = "relative z-10 flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[9px] font-semibold text-neutral-400 transition hover:text-gold-300";
  if (href) return <a href={href} className={cls} rel="external"><Icon className="h-5 w-5" /><span className="truncate">{label}</span></a>;
  return <button type="button" onClick={onComing} className={cls} title={`${label} coming soon`}><Icon className="h-5 w-5" /><span className="truncate">{label}</span></button>;
}

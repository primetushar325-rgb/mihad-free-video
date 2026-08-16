"use client";

// ============================================================
// AdminShell — client-side auth guard + responsive sidebar layout.
// Checks /api/auth/me on mount; redirects to login if unauth'd.
// ============================================================

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Film,
  FolderTree,
  Images,
  Megaphone,
  Bell,
  Gift,
  Flame, Newspaper, Globe2, Send, AppWindow, Link2,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import type { Admin } from "@/types";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/videos", label: "Videos", icon: Film },
  { href: "/admin/trending", label: "Trending", icon: Flame },
  { href: "/admin/navigation-links", label: "Navigation Links", icon: Link2 },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/slides", label: "Slider", icon: Images },
  { href: "/admin/ads", label: "Ads", icon: Megaphone },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/websites", label: "Websites", icon: Globe2 },
  { href: "/admin/telegram", label: "Telegram", icon: Send },
  { href: "/admin/giveaway", label: "Giveaway", icon: Gift },
  { href: "/admin/app-install", label: "App Install", icon: AppWindow },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.get<{ admin: Admin | null }>("/api/auth/me");
        if (!active) return;
        if (!data.admin) {
          router.replace("/admin/login");
          return;
        }
        setAdmin(data.admin);
      } catch {
        router.replace("/admin/login");
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function logout() {
    try {
      await api.post("/api/auth/logout");
      toast.success("Logged out");
    } catch {
      /* ignore */
    }
    router.replace("/admin/login");
    router.refresh();
  }

  if (checking) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!admin) return null;

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient text-lg font-black text-black">
          M
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-bold text-white">
            Mihad Admin
          </p>
          <p className="text-[11px] text-neutral-500">Control Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-gold-gradient text-black shadow-gold"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/8 p-3">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" /> View site
        </a>
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/20 text-xs font-bold text-gold-300">
            {admin.username.charAt(0).toUpperCase()}
          </div>
          <span className="flex-1 truncate text-sm text-neutral-200">
            {admin.username}
          </span>
          <button
            onClick={logout}
            aria-label="Logout"
            className="text-neutral-400 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-black/40">
      {/* Desktop sidebar */}
      <aside className="glass-strong fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gold-500/10 lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="glass-strong fixed inset-y-0 left-0 z-50 w-64 border-r border-gold-500/10 lg:hidden"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Mobile topbar */}
        <header className="glass-strong sticky top-0 z-30 flex items-center gap-3 border-b border-gold-500/10 px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-200"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display font-bold text-gold-gradient">
            Mihad Admin
          </span>
          <button
            onClick={logout}
            aria-label="Logout"
            className="ml-auto text-neutral-400"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

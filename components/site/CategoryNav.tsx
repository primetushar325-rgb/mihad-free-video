"use client";

// ============================================================
// CategoryNav — horizontally scrollable category pills.
// Used on the home page for instant filtering (controlled) and can
// also render as links (mode="link").
// ============================================================

import { LayoutGrid } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

export type ActiveCategory = "all" | number;

export default function CategoryNav({
  categories,
  active,
  onChange,
}: {
  categories: Category[];
  active: ActiveCategory;
  onChange?: (value: ActiveCategory) => void;
}) {
  const items: { id: ActiveCategory; name: string; icon?: string }[] = [
    { id: "all", name: "All", icon: "✨" },
    ...categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
  ];

  return (
    <nav className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={String(item.id)}
            onClick={() => onChange?.(item.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "border-transparent bg-gold-gradient text-black shadow-gold"
                : "border-white/10 bg-white/5 text-neutral-300 hover:border-gold-500/40 hover:text-white"
            )}
          >
            {item.id === "all" ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              item.icon && <span className="text-sm">{item.icon}</span>
            )}
            {item.name}
          </button>
        );
      })}
    </nav>
  );
}

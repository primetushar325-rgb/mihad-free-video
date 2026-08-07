"use client";

// Dedicated search input shown on /search when there's no query yet.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchResults() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <div className="mx-auto max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = value.trim();
          if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search videos, tags, categories…"
          className="field py-4 pl-12 text-base"
          aria-label="Search videos"
        />
      </form>
    </div>
  );
}

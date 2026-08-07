// ============================================================
// Search results page (server-rendered from ?q=).
// ============================================================

import type { Metadata } from "next";
import VideoGrid from "@/components/site/VideoGrid";
import SearchResults from "@/components/site/SearchResults";
import { SectionHeading } from "@/components/site/SectionHeading";
import { searchVideosSafe } from "@/lib/safe";

export const revalidate = 0;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q || "").trim();
  const results = term ? await searchVideosSafe(term, { limit: 48 }) : [];

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-5">
      <SectionHeading
        title={term ? `Results for “${term}”` : "Search Videos"}
        subtitle={
          term
            ? `${results.length} video${results.length === 1 ? "" : "s"} found.`
            : "Start typing to search across titles, tags and descriptions."
        }
      />
      {term ? (
        <VideoGrid videos={results} />
      ) : (
        <SearchResults />
      )}
    </section>
  );
}

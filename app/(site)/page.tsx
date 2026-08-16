// ============================================================
// Home page (server component).
// Fetches slides, categories and latest videos from D1, then renders
// the hero slider and the instant-filter video browser.
// ============================================================

import HeroSlider from "@/components/site/HeroSlider";
import ViralOrderBanner from "@/components/site/ViralOrderBanner";
import HomeBrowser from "@/components/site/HomeBrowser";
import ExternalWebsiteButtons from "@/components/site/ExternalWebsiteButtons";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  getSlidesSafe,
  getCategoriesSafe,
  getVideosSafe,
} from "@/lib/safe";

export const revalidate = 60; // ISR: refresh content at most once a minute

export default async function HomePage() {
  const [slides, categories, videos] = await Promise.all([
    getSlidesSafe(),
    getCategoriesSafe(),
    getVideosSafe({ limit: 60 }),
  ]);

  // JSON-LD structured data for the ItemList of videos.
  const itemListLd =
    videos.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: videos.slice(0, 20).map((v, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `/video/${v.id}`,
            name: v.title,
          })),
        }
      : null;

  const steps = [
    {
      n: "1",
      t: "Pick a video",
      d: "Filter by category or search instantly across titles, tags and descriptions.",
    },
    {
      n: "2",
      t: "Open details",
      d: "See the thumbnail, description, tags and related videos from the same category.",
    },
    {
      n: "3",
      t: "Tap Download",
      d: "The Google Drive link opens in a new tab — no hosting, no waiting, 100% free.",
    },
  ];

  return (
    <>
      {/* Viral order banner — always on top, opens the order link */}
      <div className="pt-3">
        <ViralOrderBanner />
      </div>
      <ExternalWebsiteButtons />

      {/* Hero: real slider if configured, otherwise a branded welcome banner */}
      {slides.length > 0 ? (
        <section className="mx-auto max-w-7xl px-3 pt-4 sm:px-5">
          <HeroSlider slides={slides} />
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-3 pt-4 sm:px-5">
          <div className="relative flex aspect-[16/11] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/8 px-6 text-center shadow-glass sm:aspect-[16/6]">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/15 via-black/40 to-black/80" />
            <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-500/20 blur-[100px]" />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-gradient text-3xl font-black text-black shadow-gold">
                M
              </div>
              <h2 className="font-display text-2xl font-extrabold text-gold-gradient sm:text-4xl">
                Premium Videos, Free Forever
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-300 sm:text-base">
                Browse the library and download your favourites via Google
                Drive. New videos added regularly.
              </p>
            </div>
          </div>
        </section>
      )}

      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}

      {/* Video browser (instant category + featured filtering) */}
      <section className="mx-auto max-w-7xl px-3 pb-2 pt-6 sm:px-5">
        <HomeBrowser categories={categories} videos={videos} />
      </section>

      {/* How it works (always visible onboarding) */}
      <section className="mx-auto max-w-7xl px-3 pb-6 pt-8 sm:px-5">
        <SectionHeading
          title="How it works"
          subtitle="Browse the library, open a video, and tap Download to grab it from Google Drive."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="card">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient text-sm font-black text-black">
                {s.n}
              </div>
              <h3 className="font-display font-semibold text-white">{s.t}</h3>
              <p className="mt-1 text-sm text-neutral-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

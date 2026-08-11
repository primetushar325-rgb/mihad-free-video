// ============================================================
// Video details page (server component).
// Large thumbnail, full info, Download button (Google Drive),
// related videos from the same category + SEO structured data.
// ============================================================

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Tag, ChevronLeft, Folder } from "lucide-react";
import VideoGrid from "@/components/site/VideoGrid";
import AdSlot from "@/components/site/AdSlot";
import DownloadButton from "@/components/site/DownloadButton";
import ViralOrderBanner from "@/components/site/ViralOrderBanner";
import ShareButton from "@/components/site/ShareButton";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getVideoByIdSafe, getRelatedSafe } from "@/lib/safe";
import { formatDate, siteUrl } from "@/lib/utils";

// ISR: cache video pages for fast loads & good SEO, refresh at most once a minute.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideoByIdSafe(Number(id));
  if (!video) return { title: "Video not found" };
  return {
    title: video.title,
    description: video.description || `Watch & download ${video.title} for free.`,
    openGraph: {
      type: "video.other",
      title: video.title,
      description: video.description,
      images: [{ url: video.thumbnailUrl, alt: video.title }],
      url: `${siteUrl()}/video/${video.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description: video.description,
      images: [video.thumbnailUrl],
    },
    alternates: { canonical: `${siteUrl()}/video/${video.id}` },
  };
}

export default async function VideoDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideoByIdSafe(Number(id));
  if (!video) notFound();

  const related = await getRelatedSafe(
    { id: video.id, categoryId: video.categoryId },
    8
  );

  const videoLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadTime,
    contentUrl: video.googleDriveUrl,
    url: `${siteUrl()}/video/${video.id}`,
  };

  return (
    <article className="mx-auto max-w-5xl px-3 py-5 sm:px-5">
      <ViralOrderBanner />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }}
      />

      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-gold-300"
      >
        <ChevronLeft className="h-4 w-4" /> Back to home
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Large thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/8 shadow-glass">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Info + download */}
        <div className="flex flex-col">
          {video.categoryName && (
            <Link
              href={video.categorySlug ? `/category/${video.categorySlug}` : "/"}
              className="badge mb-2 w-fit bg-gold-500/15 text-gold-300"
            >
              <Folder className="h-3 w-3" /> {video.categoryName}
            </Link>
          )}
          <h1 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            {video.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(video.uploadTime || video.createdAt)}
            </span>
          </div>

          {video.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-300">
              {video.description}
            </p>
          )}

          {video.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {video.tags.map((t) => (
                <span
                  key={t}
                  className="badge border border-white/10 bg-white/5 text-neutral-300"
                >
                  <Tag className="h-3 w-3" /> {t}
                </span>
              ))}
            </div>
          )}

          {/* Download */}
          <div className="mt-6 flex flex-wrap gap-2">
            <DownloadButton
              videoId={video.id}
              downloadUrl={video.googleDriveUrl}
              videoTitle={video.title}
            />
            <ShareButton title={video.title} />
          </div>

          <p className="mt-3 text-xs text-neutral-500">
            The download opens a Google Drive link in a new tab. Files are not
            hosted on this site.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <AdSlot slot="details" />
      </div>

      {/* Recommended / related */}
      {related.length > 0 && (
        <section className="mt-8">
          <SectionHeading
            title="Related Videos"
            subtitle="More from this category you might enjoy."
          />
          <VideoGrid videos={related} showAds={false} />
        </section>
      )}
    </article>
  );
}

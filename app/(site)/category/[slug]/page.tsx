// ============================================================
// Category page — friendly-URL (/category/:slug) listing all videos
// in a category, with SEO metadata.
// ============================================================

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import VideoGrid from "@/components/site/VideoGrid";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getCategoriesSafe, getVideosSafe } from "@/lib/safe";
import { getCategoryBySlug } from "@/lib/repository";
import { isDbConfigured } from "@/lib/db";
import { siteUrl } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (isDbConfigured()) {
    const cat = await getCategoryBySlug(slug);
    if (cat) {
      return {
        title: `${cat.name} Videos`,
        description: `Browse and download free ${cat.name} videos.`,
        alternates: { canonical: `${siteUrl()}/category/${cat.slug}` },
      };
    }
  }
  return { title: "Category" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let categoryId: number | null = null;
  let name = "Category";

  if (isDbConfigured()) {
    const cat = await getCategoryBySlug(slug);
    if (!cat) notFound();
    categoryId = cat.id;
    name = cat.name;
  }

  const videos = await getVideosSafe({ categoryId: categoryId ?? undefined });
  const categories = await getCategoriesSafe();
  void categories; // available for future breadcrumb nav

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-5">
      <SectionHeading
        title={`${name} Videos`}
        subtitle={`${videos.length} free video${
          videos.length === 1 ? "" : "s"
        } in this category.`}
      />
      <VideoGrid videos={videos} />
    </section>
  );
}

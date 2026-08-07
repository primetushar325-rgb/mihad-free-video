// Global loading state (skeletons).
import VideoCardSkeleton from "@/components/site/VideoCardSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-5">
      <div className="skeleton mb-5 aspect-[16/7] w-full rounded-3xl" />
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

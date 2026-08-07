// Skeleton placeholder for a video card (used in loading states).
export default function VideoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/8 bg-black/40">
      <div className="skeleton aspect-square w-full" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-2.5 w-1/2 rounded" />
      </div>
    </div>
  );
}

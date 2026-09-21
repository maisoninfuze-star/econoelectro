export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-surface p-3" aria-hidden="true">
      <div className="skeleton aspect-[4/5] w-full rounded-md" />
      <div className="mt-3 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton mt-3 h-6 w-1/2 rounded" />
        <div className="skeleton mt-3 h-11 w-full rounded-md" />
      </div>
    </div>
  );
}

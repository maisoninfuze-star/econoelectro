import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";

export default function Loading() {
  return (
    <div className="container-x py-10" aria-busy="true" aria-live="polite">
      <div className="skeleton h-4 w-40 rounded" />
      <div className="skeleton mt-4 h-10 w-2/3 max-w-md rounded" />
      <div className="skeleton mt-3 h-5 w-1/2 max-w-sm rounded" />
      <div className="mt-8 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

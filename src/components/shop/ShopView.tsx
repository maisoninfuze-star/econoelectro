import { Suspense } from "react";
import type { Locale } from "@/lib/i18n/config";
import { queryCatalog, filtersFromSearchParams } from "@/lib/commerce/catalog";
import type { CatalogFilters, CategoryId, Product } from "@/lib/commerce/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "./ProductFilters";
import { ShopToolbar } from "./ShopToolbar";
import { EmptyState } from "./EmptyState";
import { getDictionary } from "@/lib/i18n/dictionaries";

export type SearchParams = Record<string, string | string[] | undefined>;

export function ShopView({ products, locale, searchParams, base = {}, lockedCategory = null, listName }: { products: Product[]; locale: Locale; searchParams: SearchParams; base?: Partial<CatalogFilters>; lockedCategory?: CategoryId | null; listName: string }) {
  const dict = getDictionary(locale);
  const filters = filtersFromSearchParams(searchParams, base);
  if (lockedCategory) filters.category = lockedCategory;
  const result = queryCatalog(products, filters);
  const fallback = <div className="h-11" />;
  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8 xl:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block" aria-label={dict.shop.filters}>
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-lg border border-line bg-surface p-4">
          <h2 className="mb-3 text-base font-bold">{dict.shop.filters}</h2>
          <Suspense fallback={fallback}>
            <ProductFilters facets={result.facets} lockedCategory={lockedCategory} idPrefix="d" />
          </Suspense>
        </div>
      </aside>
      <div className="min-w-0">
        <Suspense fallback={fallback}>
          <ShopToolbar total={result.total} facets={result.facets} lockedCategory={lockedCategory} />
        </Suspense>
        {result.products.length ? (
          <ProductGrid products={result.products} listName={listName} columns={4} priorityCount={4} headingLevel="h2" />
        ) : (
          <EmptyState locale={locale} query={filters.q} currentCategory={filters.category} />
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/lib/seo/jsonld";
import { absoluteUrl } from "@/lib/seo/metadata";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, ariaLabel, className }: { items: Crumb[]; ariaLabel: string; className?: string }) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: absoluteUrl(c.href) } : {}),
          })),
        }}
      />
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-soft">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {c.href && !last ? (
                <Link href={c.href} className="hover:text-ink underline-offset-4 hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-ink" : undefined}>
                  {c.label}
                </span>
              )}
              {!last ? <Icon name="chevronRight" size={14} className="text-ink-muted" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

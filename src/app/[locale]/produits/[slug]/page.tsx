import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getActiveProducts, getCommerce } from "@/lib/commerce";
import { relatedProducts } from "@/lib/commerce/catalog";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, productJsonLd } from "@/lib/seo/jsonld";
import { href } from "@/lib/i18n/routes";
import { formatDimensions, formatInches } from "@/lib/i18n/format";
import { WARRANTY, RETURNS, getLocation } from "@/config/business";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInformation } from "@/components/product/ProductInformation";
import { ConditionGuide } from "@/components/product/ConditionGuide";
import { ProductGrid } from "@/components/product/ProductGrid";
import { RecentlyViewed, RecentlyViewedTracker } from "@/components/product/RecentlyViewed";
import { ViewItemTracker } from "@/components/product/ViewItemTracker";
import { Icon } from "@/components/ui/Icon";

type Params = Promise<{ locale: string; slug: string }>;

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getActiveProducts();
  return locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const product = await getCommerce().getProductBySlug(slug);
  if (!product || product.status !== "active") return {};
  const img = product.images[0];
  return buildMetadata({
    locale,
    title: product.seoTitle[locale] || product.seoTitle.fr,
    description: product.seoDescription[locale] || product.seoDescription.fr,
    route: "product",
    params: { slug: product.slug },
    image: img ? { url: img.src, width: img.width, height: img.height, alt: img.alt[locale] } : null,
  });
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <h2 id={`${id}-title`} className="text-h3">
        {title}
      </h2>
      <div className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const product = await getCommerce().getProductBySlug(slug);
  if (!product || product.status !== "active") notFound();
  const all = await getActiveProducts();
  const related = relatedProducts(all, product, 4);
  const title = product.title[locale] || product.title.fr;
  const loc = product.locationId ? getLocation(product.locationId) : null;
  const specs = [
    ...(product.brand ? [{ label: dict.product.brand, value: product.brand }] : []),
    ...(product.model ? [{ label: dict.product.model, value: product.model }] : []),
    ...(product.width ? [{ label: dict.product.width, value: formatInches(product.width, locale) }] : []),
    ...(product.finish || product.color ? [{ label: dict.product.colorFinish, value: [product.finish ? dict.shop.finishes[product.finish] : null, product.color?.[locale]].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(" · ") }] : []),
    ...product.specifications.map((s) => ({ label: s.label[locale] || s.label.fr, value: s.value[locale] || s.value.fr })),
    ...(loc ? [{ label: dict.product.location, value: loc.name[locale] }] : []),
  ];

  return (
    <div className="container-x py-6 lg:py-10">
      <JsonLd data={productJsonLd(product, locale)} />
      <RecentlyViewedTracker product={product} />
      <ViewItemTracker product={product} />
      <Breadcrumbs ariaLabel={dict.a11y.breadcrumb} items={[{ label: dict.nav.home, href: href(locale, "home") }, { label: dict.shop.title, href: href(locale, "shop") }, { label: dict.categories[product.category].name, href: href(locale, "category", { category: product.category }) }, { label: title }]} />

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <ProductGallery product={product} />
        <ProductInformation product={product} />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          <Section id="description" title={dict.product.description}>
            <p className="whitespace-pre-line">{product.description[locale] || product.description.fr}</p>
          </Section>
          {product.includes.length ? (
            <Section id="included" title={dict.product.included}>
              <ul className="space-y-1.5">
                {product.includes.map((i) => (
                  <li key={i.fr} className="flex items-start gap-2">
                    <Icon name="check" size={16} className="mt-1 shrink-0 text-success" /> {i[locale] || i.fr}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
          <Section id="specs" title={dict.product.specifications}>
            {specs.length ? (
              <dl className="divide-y divide-line rounded-lg border border-line bg-surface">
                {specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-[minmax(0,40%)_1fr] gap-3 px-4 py-2.5 text-sm">
                    <dt className="font-semibold text-ink">{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>{dict.product.modelUnknown}</p>
            )}
            {product.dimensions ? (
              <div className="mt-4 rounded-lg bg-canvas p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-ink">
                  <Icon name="ruler" size={16} /> {dict.product.dimensions}
                </p>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  {[
                    ["width", product.dimensions.widthIn],
                    ["height", product.dimensions.heightIn],
                    ["depth", product.dimensions.depthIn],
                  ].map(([k, v]) => (
                    <div key={String(k)}>
                      <dt className="text-xs uppercase tracking-wide text-ink-muted">{dict.product[k as "width" | "height" | "depth"]}</dt>
                      <dd className="text-base font-bold text-ink">{v ? formatInches(Number(v), locale) : "—"}</dd>
                    </div>
                  ))}
                </dl>
                <p className="sr-only">{formatDimensions(product.dimensions, locale)}</p>
              </div>
            ) : null}
          </Section>
          <Section id="condition" title={dict.product.conditionReport}>
            <p className="text-ink">
              <span className="font-semibold">{dict.product.condition} :</span> {dict.condition[product.condition]}
              {product.conditionGrade ? ` · ${dict.condition.grades[product.conditionGrade].label}` : ""}
            </p>
            <p className="mt-2">{dict.product.inspectedNote}</p>
            <h3 className="mt-4 text-sm font-bold text-ink">{dict.product.cosmeticNotes}</h3>
            <p className="mt-1">{product.conditionNotes[locale] || product.conditionNotes.fr || dict.product.cosmeticNotesEmpty}</p>
          </Section>
          <Section id="delivery" title={dict.product.deliveryInfo}>
            <p>{dict.product.deliveryBody}</p>
          </Section>
          <Section id="returns" title={dict.product.returnsInfo}>
            <p>{RETURNS.confirmed && RETURNS.summary[locale] ? RETURNS.summary[locale] : dict.product.returnsUnconfirmed}</p>
          </Section>
          {WARRANTY.confirmed && WARRANTY.summary[locale] ? (
            <Section id="warranty" title={dict.product.warrantyInfo}>
              <p>{WARRANTY.summary[locale]}</p>
            </Section>
          ) : null}
        </div>
        <div className="lg:pt-0">
          <ConditionGuide locale={locale} />
        </div>
      </div>

      {related.length ? (
        <section aria-labelledby="related-title" className="mt-14">
          <h2 id="related-title" className="text-h2">
            {dict.product.related}
          </h2>
          <div className="mt-6">
            <ProductGrid products={related} listName="related" columns={4} />
          </div>
        </section>
      ) : null}
      <RecentlyViewed excludeSlug={product.slug} />
    </div>
  );
}

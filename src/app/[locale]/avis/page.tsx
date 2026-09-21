import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo/metadata";
import { href } from "@/lib/i18n/routes";
import { REVIEWS } from "@/config/business";
import reviewsData from "@/data/reviews.json";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ReviewCard, type Review } from "@/components/home/ReviewCard";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, title: dict.reviews.seoTitle, description: dict.reviews.seoDescription, route: "reviews" });
}

export default async function ReviewsPage({ params }: { params: Params }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const reviews = reviewsData.reviews as Review[];
  return (
    <div className="container-x py-6 lg:py-10">
      <Breadcrumbs ariaLabel={dict.a11y.breadcrumb} items={[{ label: dict.nav.home, href: href(locale, "home") }, { label: dict.reviews.heading }]} />
      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-h1">{dict.reviews.heading}</h1>
          <p className="text-lead mt-3 text-ink-soft">{dict.reviews.intro}</p>
        </div>
        <LinkButton href={REVIEWS.url} variant="outline" target="_blank" rel="noopener noreferrer">
          {dict.reviews.viewAll} <Icon name="external" size={16} />
        </LinkButton>
      </header>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <li key={r.id}>
            <ReviewCard review={r} locale={locale} />
          </li>
        ))}
      </ul>
      <div className="mt-10 rounded-xl bg-surface p-6 text-center">
        <p className="text-ink-soft">{dict.reviews.leaveReview}</p>
        <LinkButton href={REVIEWS.url} className="mt-3" target="_blank" rel="noopener noreferrer">
          Google <Icon name="external" size={16} />
        </LinkButton>
      </div>
    </div>
  );
}

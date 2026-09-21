import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { href } from "@/lib/i18n/routes";
import { REVIEWS } from "@/config/business";
import reviewsData from "@/data/reviews.json";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewCard, type Review } from "./ReviewCard";

export function ReviewsSection({ locale, limit = 4, showHeading = true }: { locale: Locale; limit?: number; showHeading?: boolean }) {
  const dict = getDictionary(locale);
  const reviews = (reviewsData.reviews as Review[]).slice(0, limit);
  return (
    <section className="bg-surface py-14 lg:py-20" aria-labelledby="reviews-title">
      <div className="container-x">
        {showHeading ? (
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 id="reviews-title" className="text-h2">
                {dict.home.reviewsHeading}
              </h2>
              <p className="text-lead mt-3 text-ink-soft">{dict.home.reviewsSub}</p>
            </div>
            <LinkButton href={href(locale, "reviews")} variant="outline">
              {dict.home.reviewsCta} <Icon name="arrowRight" size={16} />
            </LinkButton>
          </Reveal>
        ) : null}
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {reviews.map((r, i) => (
            <Reveal as="li" key={r.id} delay={i * 50}>
              <ReviewCard review={r} locale={locale} />
            </Reveal>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-soft">
          <a href={REVIEWS.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-ink underline-offset-4 hover:underline">
            {dict.reviews.viewAll} ({dict.reviews.source}) <Icon name="external" size={14} />
          </a>
        </p>
      </div>
    </section>
  );
}

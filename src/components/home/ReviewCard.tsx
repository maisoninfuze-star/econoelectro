import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Icon } from "@/components/ui/Icon";

export interface Review {
  id: string;
  author: string;
  rating: number | null;
  language: "fr" | "en";
  text: string;
  dateLabel: string | null;
  sourceUrl: string | null;
}

export function ReviewCard({ review, locale }: { review: Review; locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <article className="flex h-full flex-col rounded-lg border border-line bg-canvas p-5" lang={review.language === "fr" ? "fr-CA" : "en-CA"}>
      {review.rating ? (
        <p className="flex items-center gap-0.5 text-brand" role="img" aria-label={dict.reviews.rating.replace("{rating}", String(review.rating))}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} name="star" size={16} className={i < review.rating! ? "fill-current" : "text-line-strong"} />
          ))}
        </p>
      ) : null}
      <blockquote className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink">
        <p>« {review.text} »</p>
      </blockquote>
      <footer className="mt-4 flex items-center justify-between gap-3 text-sm">
        <cite className="not-italic font-bold">{review.author}</cite>
        <span className="text-xs text-ink-soft">
          {review.dateLabel ? `${review.dateLabel} · ` : ""}
          {review.sourceUrl ? (
            <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline-offset-4 hover:underline">
              {dict.reviews.source}
            </a>
          ) : (
            dict.reviews.source
          )}
        </span>
      </footer>
    </article>
  );
}

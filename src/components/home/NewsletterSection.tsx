import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CREATIVES } from "@/config/site";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Reveal } from "@/components/ui/Reveal";

export function NewsletterSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section className="container-x py-6 lg:py-10" aria-labelledby="newsletter-title">
      <Reveal className="grid overflow-hidden rounded-xl border border-line bg-surface lg:grid-cols-[1fr_1.2fr]">
        <div className="relative hidden lg:block">
          <Image src={CREATIVES.laundry.src} alt="" width={CREATIVES.laundry.width} height={CREATIVES.laundry.height} sizes="40vw" quality={60} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="p-7 sm:p-10 lg:p-12">
          <h2 id="newsletter-title" className="text-h2 text-balance">
            {dict.home.newsletterHeading}
          </h2>
          <p className="text-lead mt-3 text-ink-soft">{dict.home.newsletterBody}</p>
          <div className="mt-6">
            <NewsletterForm variant="inline" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

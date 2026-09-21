import Link from "next/link";
import { ANNOUNCEMENT } from "@/config/business";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { href } from "@/lib/i18n/routes";

export function AnnouncementBar({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const links = [
    { label: dict.nav.about, to: href(locale, "about") },
    { label: dict.nav.locations, to: href(locale, "locations") },
    { label: dict.nav.contact, to: href(locale, "contact") },
  ];
  return (
    <div className="bg-ink text-white text-[0.8125rem]">
      <div className="container-x flex h-9 items-center justify-between gap-4">
        <p className="truncate font-medium tracking-wide text-white/90">{ANNOUNCEMENT[locale]}</p>
        <nav aria-label={dict.a11y.footerNav} className="hidden lg:block">
          <ul className="flex items-center gap-5">
            {links.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="text-white/80 hover:text-white underline-offset-4 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

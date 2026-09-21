import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { href } from "@/lib/i18n/routes";
import { BRAND, CONTACT_EMAIL, LOCATIONS, SOCIAL, WARRANTY } from "@/config/business";
import { CATEGORIES } from "@/config/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Icon } from "@/components/ui/Icon";

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const year = new Date().getFullYear();
  const socials = Object.entries(SOCIAL).filter(([, v]) => v.confirmed && v.url);
  const policyLinks: { id: "delivery" | "returns" | "privacy" | "terms" | "warranty"; label: string }[] = [
    { id: "delivery", label: dict.footer.policies.delivery },
    { id: "returns", label: dict.footer.policies.returns },
    ...(WARRANTY.confirmed ? [{ id: "warranty" as const, label: dict.footer.policies.warranty }] : []),
    { id: "privacy", label: dict.footer.policies.privacy },
    { id: "terms", label: dict.footer.policies.terms },
  ];
  return (
    <footer className="mt-16 bg-ink text-white lg:mt-24 mb-safe-bar lg:mb-0">
      <div className="container-x py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Image src="/brand/logo-white-96.png" alt={dict.common.brand} width={288} height={96} className="h-10 w-auto" sizes="150px" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{dict.footer.brandStatement}</p>
            <div className="mt-5">
              <LanguageSwitcher variant="full" className="border border-white/15 text-white hover:bg-white/10" />
            </div>
          </div>
          <nav aria-label={dict.footer.shop}>
            <h2 className="text-eyebrow text-white/55">{dict.footer.shop}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href={href(locale, "shop")} className="text-white/85 hover:text-white">
                  {dict.nav.allProducts}
                </Link>
              </li>
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={href(locale, "category", { category: c.id })} className="text-white/85 hover:text-white">
                    {dict.categories[c.id].name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={href(locale, "deals")} className="text-white/85 hover:text-white">
                  {dict.nav.deals}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={dict.footer.customerService}>
            <h2 className="text-eyebrow text-white/55">{dict.footer.customerService}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href={href(locale, "contact")} className="text-white/85 hover:text-white">
                  {dict.footer.links.contact}
                </Link>
              </li>
              <li>
                <Link href={href(locale, "reviews")} className="text-white/85 hover:text-white">
                  {dict.footer.links.reviews}
                </Link>
              </li>
              <li>
                <Link href={href(locale, "about")} className="text-white/85 hover:text-white">
                  {dict.footer.links.about}
                </Link>
              </li>
              {policyLinks.map((p) => (
                <li key={p.id}>
                  <Link href={href(locale, "policy", { policy: p.id })} className="text-white/85 hover:text-white">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-eyebrow text-white/55">{dict.footer.locations}</h2>
            <ul className="mt-4 space-y-5 text-sm">
              {LOCATIONS.map((l) => (
                <li key={l.id}>
                  <p className="font-semibold">{l.name[locale]}</p>
                  <p className="text-white/70">
                    {l.address.street}
                    <br />
                    {l.address.city} ({l.address.province}) {l.address.postalCode}
                  </p>
                  <a href={`tel:${l.phoneE164}`} className="mt-1 inline-flex items-center gap-2 font-semibold text-white hover:underline underline-offset-4">
                    <Icon name="phone" size={15} /> {l.phone}
                  </a>
                </li>
              ))}
              <li className="flex items-start gap-2 text-white/70">
                <Icon name="clock" size={16} className="mt-0.5 shrink-0" />
                <span>{dict.footer.hours}</span>
              </li>
              {CONTACT_EMAIL.confirmed && CONTACT_EMAIL.value ? (
                <li>
                  <a href={`mailto:${CONTACT_EMAIL.value}`} className="inline-flex items-center gap-2 text-white/85 hover:text-white">
                    <Icon name="mail" size={15} /> {CONTACT_EMAIL.value}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>{dict.footer.copyright.replace("{year}", String(year)).replace("{brand}", BRAND.legalName)}</p>
          {socials.length ? (
            <ul className="flex items-center gap-4" aria-label={dict.footer.social}>
              {socials.map(([name, v]) => (
                <li key={name}>
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-white">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

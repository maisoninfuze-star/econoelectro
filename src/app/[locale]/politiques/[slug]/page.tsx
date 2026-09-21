import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo/metadata";
import { href, policyIdFromSlug, policySlugs, type PolicyId } from "@/lib/i18n/routes";
import { formatDate } from "@/lib/i18n/format";
import { WARRANTY } from "@/config/business";
import { getPolicy } from "@/content/policies";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

type Params = Promise<{ locale: string; slug: string }>;

function resolve(slug: string): PolicyId | null {
  const id = policyIdFromSlug(slug, "fr");
  if (!id) return null;
  if (id === "warranty" && !WARRANTY.confirmed) return null;
  return id;
}

export function generateStaticParams() {
  return locales.flatMap((locale) => (Object.keys(policySlugs) as PolicyId[]).filter((p) => p !== "warranty" || WARRANTY.confirmed).map((p) => ({ locale, slug: policySlugs[p].fr })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const id = resolve(slug);
  if (!id) return {};
  const policy = getPolicy(id, locale);
  return buildMetadata({ locale, title: `${policy.title} | Écono Électro`, description: policy.intro, route: "policy", params: { policy: id } });
}

export default async function PolicyPage({ params }: { params: Params }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const id = resolve(slug);
  if (!id) notFound();
  const dict = getDictionary(locale);
  const policy = getPolicy(id, locale);
  return (
    <div className="container-x py-6 lg:py-10">
      <Breadcrumbs ariaLabel={dict.a11y.breadcrumb} items={[{ label: dict.nav.home, href: href(locale, "home") }, { label: policy.title }]} />
      <article className="prose-econo mt-4 max-w-3xl">
        <h1 className="text-h1">{policy.title}</h1>
        <p className="mt-2 text-xs text-ink-muted">{dict.policies.updated.replace("{date}", formatDate(policy.updated, locale))}</p>
        <p className="text-lead mt-4 text-ink-soft">{policy.intro}</p>
        {policy.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.paragraphs?.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}
            {s.bullets?.length ? (
              <ul>
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        <p className="mt-8 rounded-md bg-surface p-4 text-sm">{dict.policies.contactNote}</p>
      </article>
    </div>
  );
}

import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo/metadata";
import { href } from "@/lib/i18n/routes";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, title: dict.checkout.confirmationTitle, description: dict.checkout.confirmationBody, route: "checkoutConfirmation", noIndex: true });
}

export default async function ConfirmationPage({ params }: { params: Params }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return (
    <div className="container-x py-20 text-center">
      <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
        <Icon name="check" size={30} />
      </span>
      <h1 className="text-h1 mt-5">{dict.checkout.confirmationTitle}</h1>
      <p className="text-lead mx-auto mt-3 max-w-lg text-ink-soft">{dict.checkout.confirmationBody}</p>
      <LinkButton href={href(locale, "home")} className="mt-7" size="lg">
        {dict.errors.backHome}
      </LinkButton>
    </div>
  );
}

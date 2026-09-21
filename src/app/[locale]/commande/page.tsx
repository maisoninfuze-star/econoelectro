import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCommerce } from "@/lib/commerce";
import { buildMetadata } from "@/lib/seo/metadata";
import { CheckoutView } from "@/components/cart/CheckoutView";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, title: dict.seo.checkoutTitle, description: dict.checkout.hostedNote, route: "checkout", noIndex: true });
}

export default async function CheckoutPage({ params }: { params: Params }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return (
    <div className="container-x py-6 lg:py-10">
      <h1 className="text-h1">{dict.checkout.title}</h1>
      <div className="mt-6">
        <CheckoutView checkoutLive={getCommerce().isCheckoutLive()} />
      </div>
    </div>
  );
}

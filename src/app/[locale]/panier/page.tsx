import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCommerce } from "@/lib/commerce";
import { buildMetadata } from "@/lib/seo/metadata";
import { href } from "@/lib/i18n/routes";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CartPageView } from "@/components/cart/CartPageView";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, title: dict.seo.cartTitle, description: dict.cart.emptyBody, route: "cart", noIndex: true });
}

export default async function CartPage({ params }: { params: Params }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return (
    <div className="container-x py-6 lg:py-10">
      <Breadcrumbs ariaLabel={dict.a11y.breadcrumb} items={[{ label: dict.nav.home, href: href(locale, "home") }, { label: dict.cart.title }]} />
      <h1 className="text-h1 mt-4">{dict.cart.title}</h1>
      <div className="mt-6">
        <CartPageView checkoutLive={getCommerce().isCheckoutLive()} />
      </div>
    </div>
  );
}

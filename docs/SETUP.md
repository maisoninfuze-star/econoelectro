# Setup

## Requirements

- Node.js 20+ (built with Node 24) and npm.
- No database. The demo catalog is committed as `src/data/products.json`.

## Environment

Copy `.env.example` to `.env.local`. Every variable is optional in demo mode.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used in metadata, sitemap, JSON-LD. |
| `COMMERCE_PROVIDER` | `local` (default) or `shopify`. |
| `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_STOREFRONT_API_VERSION` | Storefront API access. When set with `COMMERCE_PROVIDER=shopify`, catalog, inventory, cart and **hosted checkout** are live. |
| `NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL` | Shows the account icon (links to Shopify customer accounts). |
| `CONTACT_FORM_WEBHOOK_URL` | JSON webhook for the contact form and stock alerts (Make/Zapier/Formspree/n8n). Unset in production → the form shows a phone fallback. |
| `NEWSLETTER_WEBHOOK_URL` | JSON webhook for newsletter sign-ups (Klaviyo/Mailchimp flow, etc.). |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` | Optional. Without it the keyless Google Maps embed is used. Maps load only on interaction / near viewport. |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL`, `NEXT_PUBLIC_META_PIXEL_ID` | Tracking. Nothing loads before consent (Consent Mode v2 default = denied). |
| `FAL_KEY` | Only for `npm run creatives:generate`. |

## Checkout state

- **Demo (`local`)**: the cart works end-to-end (add, quantity limits, pickup/delivery per line, remove). "Passer à la caisse" opens `/commande`, which clearly states that payment is disabled and offers phone reservation. **The site never pretends checkout is live.**
- **Shopify**: `/api/checkout` returns the cart's `checkoutUrl` (UTM parameters appended) and the browser is redirected to Shopify's PCI-compliant hosted checkout. Quebec taxes (GST/QST), discount codes, confirmation page and confirmation email are handled by Shopify. Inventory is reserved by Shopify during checkout.

## Forms

All forms POST JSON to a webhook so the business can pick any tool. Payload shapes:

```json
{ "type": "contact", "name": "…", "email": "…", "phone": "…", "subject": "product|delivery|order|other", "product": "…", "message": "…", "locale": "fr" }
{ "type": "newsletter", "email": "…", "category": "refrigerateurs", "consent": true, "locale": "fr" }
{ "type": "stock_alert", "email": "…", "productId": "…", "productTitle": "…", "category": "…", "locale": "fr" }
```

In development, unconfigured forms succeed and log to the console so the flow can be tested.

## Analytics events

`src/lib/analytics/events.ts` pushes GA4-style events to `window.dataLayer` (and `gtag` / `fbq` when loaded): `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`, `purchase` (fire from Shopify's checkout pixel / thank-you page), `search`, `filter_products`, `click_call`, `click_directions`, `contact_submit`, `newsletter_submit`, `stock_alert_submit`, `quick_view`.

UTM/gclid/fbclid are captured in `sessionStorage` on landing and appended to the Shopify checkout URL.

## Language routing

- French is the default and lives at the root (`/boutique`, `/produits/[slug]`…).
- English uses `/en` + English slugs (`/en/shop`, `/en/products/[slug]`, `/en/category/refrigerators`…).
- `src/proxy.ts` rewrites public paths to the internal French file-system routes under `src/app/[locale]/`. Route slugs are defined once in `src/lib/i18n/routes.ts`.
- Canonical + `hreflang` (fr-CA, en-CA, x-default) are emitted on every page.

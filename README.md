# Écono Électro Services — storefront

Bilingual (FR-CA default / EN) e-commerce storefront for Écono Électro Services, a refurbished-appliance retailer with two stores in Laval, QC.

- **Stack**: Next.js 16 (App Router, React 19), TypeScript, Tailwind CSS v4. No UI kit, no state library.
- **Commerce**: provider-agnostic adapter (`src/lib/commerce`). `local` = demo catalog + cookie cart + checkout disabled. `shopify` = Storefront API catalog, inventory, cart and hosted checkout.
- **Content**: business facts in `src/config/business.ts`, copy in `src/locales/{fr,en}.json`, policies in `src/content/policies.ts`.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — the demo mode runs without any key
npm run dev
```

Open <http://localhost:3000> (French) or <http://localhost:3000/en> (English).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` · `npm run typecheck` · `npm run check` | ESLint · `tsc --noEmit` · lint + types + build |
| `npm run catalog:clean` | Rebuild `src/data/products.json` from the raw Hostinger export + human overrides |
| `npm run images:import -- --from <dir>` | Fetch/optimize product photos into `public/images/products` |
| `npm run creatives:generate` | Regenerate editorial creatives with fal.ai (needs `FAL_KEY`) |

## Documentation

- [docs/SETUP.md](docs/SETUP.md) — environment, providers, forms, analytics
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — deploying to Vercel (or any Node host) and DNS cut-over
- [docs/SHOPIFY-SETUP.md](docs/SHOPIFY-SETUP.md) — what the business manages in Shopify, metafields, import
- [docs/CATALOG-IMPORT.md](docs/CATALOG-IMPORT.md) — non-destructive cleanup pipeline and review list
- [docs/BUSINESS-CONFIRMATION.md](docs/BUSINESS-CONFIRMATION.md) — facts to confirm before launch
- [docs/CREATIVES.md](docs/CREATIVES.md) — how fal.ai was used (and not used)
- [docs/REDIRECTS.md](docs/REDIRECTS.md) — old URL → new URL map

## Project map

```
src/app/[locale]/…        Pages (internal French segments; /en/* public slugs are rewritten by src/proxy.ts)
src/app/api/…             Cart, checkout handoff, contact, newsletter, stock-alert endpoints
src/components/…          layout / home / product / shop / cart / forms / ui
src/lib/commerce/…        Types, catalog search + filters, local & Shopify providers
src/lib/i18n/…            Locales, routes, price/date formatting
src/lib/seo/…             Metadata + JSON-LD builders
src/lib/analytics/…       GA4/Ads/Meta events, Consent Mode, UTM capture
src/config/…              business.ts (facts), site.ts (categories, creatives)
src/data/…                products.json (generated), source export, reviews, redirects, review flags
scripts/…                 clean-catalog, import-images, fal-creatives, catalog-overrides
```

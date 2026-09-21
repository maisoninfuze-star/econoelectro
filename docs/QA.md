# QA log (2026-09-13)

Environment: Next.js 16.3.5, Node 24, demo (`local`) commerce provider. Automated checks run with `npm run check` (ESLint + `tsc --noEmit` + `next build`) — all green. Browser checks done in the in-app Chromium at 1404 px (desktop), 1024 px and 375 px (mobile emulation).

| # | Check | Result |
| --- | --- | --- |
| 1 | Lint | ✅ 0 errors, 0 warnings |
| 2 | Type check | ✅ |
| 3 | Production build | ✅ 115 prerendered pages (FR + EN), proxy compiled |
| 4 | Primary navigation | ✅ Sticky header compacts on scroll; mega menu opens on hover/click/keyboard, closes on Escape; mobile drawer with categories, phones, hours, language |
| 5 | Search | ✅ Overlay with live suggestions; `frigo`, `fridge`, `refrigerator`, `réfrigérateur` all return the same 18 refrigerators; `washer`/`laveuse` 12; `stove`/`cuisinière` 16 |
| 6 | Filters | ✅ Sidebar (desktop) and bottom-sheet drawer (mobile); state in URL (`?marque=…&prix_max=…&tri=…`); chips; clear all; empty state with alternatives + phone |
| 7 | Product pages | ✅ Gallery with thumbnails, zoom and lightbox; buy box with pickup/delivery, quantity limits, phone help; specs, dimensions, condition report, condition guide, related and recently viewed; JSON-LD Product/Offer/Breadcrumb |
| 8 | Cart | ✅ Right drawer on add; per-line fulfillment and store; quantity stepper hidden for unique units; remove; subtotal + tax/delivery notes; full cart page |
| 9 | Inventory limits | ✅ Second add of a unique unit → 409 `quantity_limit`; "à partir de" listings → 409 `price_on_request`; draft/unpublished product → 400 |
| 10 | Both languages | ✅ `/` FR, `/en` EN with English slugs; switcher keeps the current page and query; hreflang fr-CA / en-CA / x-default; prices `749,00 $` vs `$749.00` |
| 11 | Both store locations | ✅ Cards with address, phone (`tel:`), hours, Itinéraire (Maps directions), lazy map; LocalBusiness schema ×2 |
| 12 | Forms | ✅ Contact (validation 422, dev success), newsletter (consent required), stock alert; honeypots |
| 13 | Checkout handoff | ✅ `/api/checkout` → `{live:false}` in demo → `/commande` shows "mode démonstration", payment disabled, phone reservation. With Shopify keys → hosted checkout redirect |
| 14 | Keyboard navigation | ✅ Skip link, visible focus rings, Tab order through header, dialogs trap focus and restore it |
| 15 | Reduced motion | ✅ `prefers-reduced-motion` disables reveals and animations (CSS + `matchMedia` guard) |
| 16 | Mobile layouts | ✅ 375 px: no horizontal overflow, 44 px targets, sticky bottom bar (Magasiner / Appeler / Panier) with safe-area padding, hidden while a dialog is open |
| 17 | Metadata & structured data | ✅ Unique titles/descriptions, canonical, OG images (site + per product), Organization, WebSite+SearchAction, LocalBusiness, Product/Offer, BreadcrumbList; no AggregateRating |
| 18 | Redirects | ✅ 42 legacy URLs → 308 (see `docs/REDIRECTS.md`); `/fr/*` → unprefixed; unknown paths → real 404 |
| 19 | Console | ✅ No hydration or runtime errors on a fresh load |
| 20 | Placeholder claims / fabricated reviews | ✅ Only the 4 reviews from the previous site; warranty/returns/email gated behind `confirmed` flags |

## Lighthouse (production build, `next start`, Chrome headless)

Generated with `npx lighthouse` (mobile = simulated slow 4G + 4× CPU throttle).

| Page | Perf | A11y | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| Accueil (desktop) | 99 | 100 | 100 | 100 | 0.8 s | 0 |
| Boutique (desktop) | 100 | 100 | 100 | 100 | 0.8 s | 0 |
| Produit (desktop) | 100 | 100 | 100 | 100 | 0.7 s | 0 |
| Accueil (mobile) | 89 | 100 | 100 | 100 | 3.7 s | 0 |
| Boutique (mobile) | 92 | 100 | 100 | 100 | 3.3 s | 0 |
| Produit (mobile) | 93 | 100 | 100 | 100 | 3.2 s | 0 |


## Known limitations

- Demo mode: checkout is intentionally disabled until Shopify credentials are provided.
- 6 products have no usable photo (only promotional flyers existed); they show the "Photo à venir" fallback and are flagged in `src/data/catalog-review.json`.
- Condition grades are not assigned in the demo data (the business assigns them per unit in Shopify).

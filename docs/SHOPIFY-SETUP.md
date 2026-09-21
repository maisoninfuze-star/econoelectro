# Shopify as the commerce backend

The previous site ran on Hostinger's built-in store, which has no public API. Shopify gives the business a full admin (products, images, prices, compare-at prices, inventory per location, orders, discounts, customers, fulfillment) without touching code, plus a PCI-compliant hosted checkout with Quebec taxes.

## 1. Create the store

- Shopify plan of choice, currency **CAD**, store address in Laval (QC) so GST/QST are configured automatically.
- **Locations**: create "Écono Électro – Vimont (901 rue Michelin)" and "Écono Électro – Chomedey (1777 boul. Curé-Labelle)". Enable **local pickup** on both. Add a **local delivery** or shipping rate for the delivery zone once fees are confirmed.
- **Headless / Storefront API**: install the *Headless* channel (or create a custom app) and create a Storefront API access token with `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`.
- Set `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `COMMERCE_PROVIDER=shopify`.

## 2. Product fields

Native fields used: title (French), description (French), vendor (= brand), images, price, compare-at price, inventory quantity (tracked, "unique" units = quantity 1), status.

Metafields in namespace **`econo`** (Settings → Custom data → Products). The storefront reads them; the admin edits them like normal fields:

| Key | Type | Values / notes |
| --- | --- | --- |
| `title_en` | single line text | English title |
| `description_en` | multi-line text | English description |
| `short_description_fr` / `short_description_en` | single line text | Card subtitle |
| `category` | single line text | `refrigerateurs` · `cuisinieres` · `laveuses-secheuses` · `ensembles` · `autres` |
| `subcategory` | single line text | e.g. `portes-francaises`, `electrique`, `double-four`, `ensemble-laveuse-secheuse`, `4-appareils`, `congelateur` |
| `model` | single line text | Model number |
| `condition` | single line text | `refurbished` · `new` · `open-box` |
| `condition_grade` | single line text | `like-new` · `very-good` · `good` · `cosmetic` |
| `condition_notes_fr` / `condition_notes_en` | multi-line text | Visible cosmetic notes |
| `width_in` / `height_in` / `depth_in` | integer | Inches |
| `finish` | single line text | `stainless` · `white` · `black` · `grey` · `slate` |
| `color_fr` / `color_en` | single line text | |
| `location` | single line text | `vimont` · `chomedey` |
| `featured`, `new_arrival`, `delivery_eligible`, `pickup_eligible`, `price_from`, `purchasable` | true/false | |
| `specifications` | JSON | `[{"label":{"fr":"…","en":"…"},"value":{"fr":"…","en":"…"}}]` |
| `includes` | JSON | `[{"fr":"…","en":"…"}]` |
| `warranty` | single line text | Shown only when `WARRANTY.confirmed` is true in `src/config/business.ts` |

Tags recognised for badges: `stock-limite`, `disponible-aujourdhui`, `meilleure-vente`, `nouvel-arrivage`, `vedette`, `gift-card`.

## 3. Import the cleaned catalog

`src/data/products.json` is the cleaned catalog (33 active + 3 draft). Two options:

1. **CSV**: export it with a small script to Shopify's product CSV (title, vendor, tags, price, compare-at, quantity, image URLs pointing to the deployed site's `/images/products/...`), then set metafields in the admin or via the Admin API.
2. **Admin API**: write a one-off importer using `productSet` mutations with the metafields above. The file is already in the right shape.

Records in `src/data/catalog-review.json` must be reviewed by staff before import (unknown brands, "à partir de" listings that should be split into individual units, missing photos, suspicious prices).

## 4. Daily operations (no code)

- Add a product with photos, price, compare-at price, quantity 1, location, condition grade and notes.
- When a unit sells in store, set quantity to 0 or archive: it disappears from the site within a minute (60 s revalidation).
- Orders, discounts, customers, fulfillment status: Shopify admin.
- Gift cards: use Shopify's built-in gift card product rather than a normal product.

## 5. Checkout customisation

- Enable **local pickup** so customers choose a store in checkout; the storefront also passes the chosen method as line attributes ("Réception", "Succursale").
- Set the thank-you page and confirmation email language to French with English fallback.
- Add the Google/Meta pixels in Shopify's *Customer events* so `purchase` is tracked on the hosted checkout.

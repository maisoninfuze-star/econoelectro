# Meta (Facebook / Instagram) ads kit

Everything needed to run product ads from the live catalog, without editing code when inventory changes.

## What is generated

| Piece | Where | Notes |
| --- | --- | --- |
| Ad creatives per product | `exports/meta-ads/<locale>/<slug>/square.png` (1080×1080), `portrait.png` (1080×1350), `story.png` (1080×1920) | Real product photo, brand panel with price, compare-at price, condition, store, phone. Stories keep the bottom 300 px free for the platform UI. |
| Studio variants (optional) | `…/<slug>/<format>-studio.png` | Same layout, background removed by fal.ai (Bria RMBG), appliance on a soft studio backdrop. Only for products with a **reviewed** cutout. |
| Scene variants (optional) | `…/<slug>/<format>-scene.png` | Same layout, the real cutout placed in a fal.ai-generated kitchen or laundry room (Bria Product Shot). Only for products with a **reviewed** scene. |
| Campaign creatives | `…/campaigns/<key>/<format>.png` | Five campaign angles on fal.ai FLUX editorial scenes (no specific unit shown) with the campaign headline. |
| Ad videos | `…/videos/<slug>/{square,story}.mp4`, `…/videos/campaigns-<key>/…` | 6-second silent H.264 videos (1080×1080 feed, 1080×1920 Reels/Stories): a fal.ai Kling clip (slow camera push-in on the scene, appliance kept static) under the same price/condition panel, panel fades in, last frame held 1 s. |
| Ad copy | `exports/meta-ads/<locale>/ad-copy.md` and `.json` | Primary text, headline (≤ 40 chars), description, call to action and UTM-tagged landing URL for every product, plus 5 campaign angles. |
| Contact sheet | `exports/meta-ads/<locale>/contact-sheet.jpg` | One-glance review of all square creatives. |
| Catalog feed | `https://www.econoelectroservices.com/feeds/meta-catalog.csv` (add `?locale=en` for English) | Live CSV for Commerce Manager: id, title, description, availability, condition (`refurbished`), price / sale_price in CAD, link, images, brand, product type, Google category, quantity. Refreshes every 5 minutes. |

`exports/` is git-ignored: regenerate rather than commit.

## Generate

```bash
npm run dev                       # terminal 1
npm run ads:export                # terminal 2 → exports/meta-ads/fr
npm run ads:export -- --locale en # English set
npm run ads:export -- --only laveuse-et-secheuse-samsung-grises,refrigerateur-maytag-de-36-po
```

The exporters start a local `next dev` server automatically when nothing is listening on the base URL, and stop it afterwards (`--no-auto-server` disables this). Against a production deployment, set `ADS_EXPORT_ENABLED=1` and pass `--base https://www.econoelectroservices.com`. Without that variable the `/api/ads/*` routes return 404 in production. The catalog feed is always public (Meta must fetch it).

### Studio backgrounds (fal.ai)

```bash
FAL_KEY=... npm run ads:cutouts   # writes public/images/ads/cutouts/<id>.png + manifest.json
```

Open the cutouts folder and **delete any file that is not clean** (on cluttered store shots the model sometimes keeps a sliver of a neighbouring unit). Then `npm run ads:export -- --studio`. The appliance pixels are never altered; only the surroundings are removed. Products without a cutout simply fall back to the real photo.

### Lifestyle scenes (fal.ai Bria Product Shot)

```bash
FAL_KEY=... npm run ads:scenes      # approved cutouts → public/images/ads/scenes/<id>.jpg + manifest.json
```

Bria places the cutout into a generated room described per category (kitchen alcove for refrigerators, cabinetry run for ranges, laundry room for washer/dryer sets) and only paints the surroundings; the unit itself, including its stickers and wear, stays identical to the store photo. **Review every scene** and delete any where the model invented another appliance or the scale looks off, then `npm run ads:export -- --studio --scenes`.

### Ad videos (fal.ai Kling 2.5 Turbo Pro + ffmpeg)

```bash
FAL_KEY=... npm run ads:videos          # clips for every approved scene + the 5 campaign scenes → exports/meta-ads/video-clips
npm run ads:export-videos               # composes exports/meta-ads/fr/videos (+ frame-sheet.jpg for review); --locale en for English
```

The clip prompt pins the appliance as static and only moves the camera; Kling, Hailuo and Wan all kept the unit unchanged in tests, Kling being the fastest (about 75 s per clip) and sharpest. Still, **review `frame-sheet.jpg`** and delete any clip in `video-clips/` where the unit drifts; the manifest records rejections so a re-run skips them. Needs `ffmpeg` on the PATH (`brew install ffmpeg`). Clips are git-ignored (≈ 18 MB each).

### Campaign scenes (fal.ai FLUX)

`npm run creatives:generate` produces the editorial scenes used by the campaign creatives (`kitchen-range`, `kitchen-fridge`, `kitchen-lifestyle`, `laundry-lifestyle`, `hero-appliance-set-wide`). They depict generic appliances, never a unit for sale, which is why they are used only for category-level ads.

## Set up in Meta

1. **Pixel**: add `NEXT_PUBLIC_META_PIXEL_ID` to the site. Events (`ViewContent`, `AddToCart`, `InitiateCheckout`, `Search`, `Lead`) fire after cookie consent with `content_ids` equal to the feed `id` column, so dynamic ads can retarget viewed products. Add the pixel to Shopify's checkout for `Purchase`.
2. **Catalog**: Commerce Manager → Catalogs → Create (E-commerce) → Data sources → *Scheduled feed* → URL above → hourly. Choose the French feed as the default and add the `?locale=en` feed as a language feed if you run English ads.
3. **Campaigns** (suggested starting structure, all "Sales" objective, Laval + 25 km, 25–65, FR and EN language targeting):
   - **Advantage+ catalog ads** using the feed: broad prospecting + retargeting of `ViewContent`/`AddToCart` in the last 14 days. This is the always-on campaign; sold units drop out automatically because availability flips to *out of stock*.
   - **Ensembles**, **Laveuses et sécheuses**, **Réfrigérateurs**, **Cuisinières**: manual ad sets with 3–5 product creatives each (square for feed, portrait for Instagram feed, story for Stories/Reels). Copy in `ad-copy.md`.
   - **Notoriété locale**: brand angle for cold audiences, landing on the shop.
4. **Landing pages**: every URL in the copy carries `utm_source=facebook&utm_medium=paid_social&utm_campaign=meta-catalogue-2026-09&utm_content=<slug>`; UTMs are preserved through to the Shopify checkout.

## Compliance and honesty rules built in

- Prices, compare-at prices and savings come from the catalog; a discount is shown only when a real compare-at price exists.
- Condition is always stated ("Remis à neuf · Inspecté et testé"); the catalog feed uses `condition=refurbished`.
- Stock wording is factual: "Unité unique" only for one-of-a-kind units, "N en stock" only when the quantity is known, "à partir de" only for multi-unit listings.
- No warranty, financing, review counts or "meilleur prix garanti" claims. Add warranty wording to the copy templates in `src/lib/ads/copy.ts` only after `WARRANTY.confirmed` is set in `src/config/business.ts`.
- Sold products are marked in the copy file ("ne pas diffuser") and disappear from the feed.

## Files

- `src/lib/ads/creative.tsx` — creative layout (next/og + Manrope)
- `src/lib/ads/copy.ts` — copy templates, FR and EN
- `src/app/api/ads/[slug]/route.tsx`, `src/app/api/ads/copy/route.ts` — render endpoints
- `src/app/feeds/meta-catalog.csv/route.ts` — catalog feed
- `scripts/export-meta-ads.mjs`, `scripts/export-meta-videos.mjs`, `scripts/fal-cutouts.mjs`, `scripts/fal-scenes.mjs`, `scripts/fal-videos.mjs`, `scripts/fal-creatives.mjs` — exporters and fal.ai generators (`scripts/lib/ensure-server.mjs` starts a dev server automatically when none is running)
- `src/app/api/ads/campaign/[key]/route.tsx` — campaign creative endpoint

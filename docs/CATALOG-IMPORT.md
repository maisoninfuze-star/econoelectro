# Catalog cleanup pipeline (non-destructive)

```
src/data/source/hostinger-products.json   raw export from the previous site — NEVER edited
scripts/catalog-overrides.mjs             human-authored titles, specs, categories, flags (traceable to the source text)
scripts/clean-catalog.mjs                 automated cleaning + overrides → src/data/products.json
scripts/import-images.mjs                 downloads/crops/optimizes photos → public/images/products + src/data/product-images.json
src/data/catalog-review.json              records flagged for manual review
src/data/redirects.json                   old URL → new URL (consumed by next.config.ts)
```

Run: `npm run catalog:clean && npm run images:import && npm run catalog:clean` (second pass embeds exact image dimensions).

## What the cleaner does

- Strips emojis, decorative punctuation, "| EconoElectroServices" suffixes and promotional phrases from names; converts ALL-CAPS titles to sentence case while keeping brand casing.
- Detects brand (Samsung, LG, Whirlpool, Maytag, GE/GE Profile, Frigidaire, KitchenAid, Amana, Blomberg…), category, nominal width (33 po/36 po), dimensions (L/H/P), "à partir de" pricing, quantities mentioned ("5 units"), store location (901 Michelin → Vimont), warranty mentions and limited-stock wording.
- Moves promotional information into structured fields: `compareAtPrice` (only when the source displayed a struck price), `badges` (`sale`, `limited-stock`, `available-today`, `new-arrival`), `priceFrom`.
- Excludes promotional flyer images (price baked into the artwork) from galleries; keeps them in the source file. Two flyers containing a real photo of the unit are cropped to the photo. Overrides can also set `excludeImages` (drop a specific photo) and `leadImage` (put the exterior shot first) per product.
- Generates clean slugs from the French title, unique per product, and a redirect from every old slug.
- Marks 3 template/incomplete records as `draft` (not published): "Premium Appliances Set", "Washer & Dryer" at $49, and the Hostinger demo "shirt-jacket" product.
- Never invents specifications or model numbers: fields stay `null` and the record is flagged.

## Review list

`src/data/catalog-review.json` lists 26 records with reasons, e.g. brand not identified, no usable photo, quantity to confirm, "à partir de" listings to split into single units, price conflicts between title and description.

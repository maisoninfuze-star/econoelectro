# Creatives and product visuals

## What fal.ai generated

`scripts/fal-creatives.mjs` (model `fal-ai/flux-pro/v1.1-ultra`) produced four **editorial scenes**, stored in `public/images/creatives/` with the prompts in `manifest.json`:

| File | Used for |
| --- | --- |
| `hero-appliance-set.webp` (4:5) | Homepage hero composition |
| `hero-appliance-set-wide.webp` (16:9) | Default Open Graph image |
| `kitchen-lifestyle.webp` (4:3) | "Équipez votre maison" promotional split |
| `laundry-lifestyle.webp` (4:3) | Newsletter section |

They depict generic appliance sets and interiors, never a specific unit for sale, and carry no text or logos.

## Why product photos are NOT AI-edited

A test run of a generative edit (`fal-ai/nano-banana/edit`, "keep this exact appliance, clean background") on a real store photo returned a **different appliance** (a white coil-top range instead of the stainless smooth-top range in the photo). Background removal (`fal-ai/bria/background/remove`) on cluttered store shots cut out neighbouring units. Either would mislead customers about what they are buying, so:

- Product cards and pages always show the **real photos of the actual unit**, resized and converted to WebP by `scripts/import-images.mjs` (no generative changes).
- Consistency comes from layout (4:5 frame, object-fit cover, uniform card design), not from altering the photos.
- Flyer artwork with baked-in prices is excluded from galleries.

## Recommended next step for better product visuals

Photograph each unit against the store's plain wall with even light (front, 3/4, open door, control panel, any cosmetic marks). The site's gallery, zoom and condition report are built for that.

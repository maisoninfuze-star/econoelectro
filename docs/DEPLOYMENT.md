# Deployment

## Vercel (recommended)

1. Push the repository to GitHub/GitLab and import it in Vercel (framework preset: Next.js, Node 20+).
2. Add environment variables from `.env.example` (at minimum `NEXT_PUBLIC_SITE_URL`). Add Shopify variables when the store is ready.
3. Deploy. Preview deployments run in demo mode unless variables are set.
4. Add the domains `econoelectroservices.com` and `www.econoelectroservices.com`; Vercel redirects apex → www automatically if www is primary.

## Any Node host

```bash
npm ci
npm run build
npm start          # listens on $PORT (default 3000)
```

Serve behind HTTPS. The app is stateless: the cart lives in a cookie (`ee_cart`) or in Shopify.

## DNS cut-over from Hostinger

1. Deploy and verify on the temporary URL (both languages, product pages, cart, forms).
2. Point the `www` CNAME to the host, and the apex `A`/`ALIAS` record as instructed by the host.
3. Keep the Hostinger site online until DNS propagates. All old URLs are 301-redirected (see `docs/REDIRECTS.md`).
4. Submit `https://www.econoelectroservices.com/sitemap.xml` in Google Search Console and check the "Redirect" coverage after a few days.

## Post-launch checklist

- [ ] Google Business Profile links to the new site, and `REVIEWS.url` in `src/config/business.ts` points to the exact Place link.
- [ ] Contact email confirmed (`CONTACT_EMAIL` in `src/config/business.ts`).
- [ ] GA4 / Ads / Meta IDs added; verify events with Tag Assistant after granting consent.
- [ ] Shopify checkout tested with a real $1 product, then refunded.
- [ ] Lighthouse run on `/`, `/boutique`, a product page (mobile + desktop).

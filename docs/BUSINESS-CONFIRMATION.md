# Facts to confirm before launch

Everything below is centralised in `src/config/business.ts` and is either hidden or phrased neutrally until confirmed.

| Item | Current state | Where |
| --- | --- | --- |
| **Contact email** | Previous site showed `econoelectro2.@gmail.com` (malformed). Not published. | `CONTACT_EMAIL` — set `value` and `confirmed: true` |
| **Warranty** | Listings mentioned "garantie de 3 mois". Not displayed anywhere; warranty policy page hidden. | `WARRANTY` — set `summary.fr/en` and `confirmed: true` |
| **Returns / refunds** | No terms stated; product pages say terms are explained before purchase. | `RETURNS` |
| **Delivery fees, zones, lead time, installation** | "Livraison disponible" is shown (advertised by the business). Fees/zones/timing are "confirmed when you order". Listings mentioned Laval/Montréal and "50 % de rabais le week-end" — not published. | `FULFILLMENT.delivery` |
| **Financing** | Not mentioned. | `FINANCING` |
| **Google reviews link** | Address-based Maps search. Replace with the Google Business Profile / Place link. | `REVIEWS.url` |
| **Social profiles** | None linked on the old site. Footer shows none until confirmed. | `SOCIAL` |
| **WhatsApp** | No business WhatsApp number known; button disabled. | `WHATSAPP` |
| **Alternate domain** | A listing mentioned `www.econoelectro.ca`. If owned, redirect it to the main domain. | `BRAND.alternateDomainUnconfirmed` |
| **Store nicknames** | "Vimont" (Michelin) and "Chomedey" (Curé-Labelle) come from a listing; confirm the naming. | `LOCATIONS[].name` |
| **Map coordinates** | Approximate from the addresses; used for LocalBusiness schema only. | `LOCATIONS[].geo` |
| **Number of customers** | Old meta said "Over 2000 happy customers" — unverified, not used. | — |
| **Condition grades per unit** | The grade system exists; grades are not assigned in the demo data. Staff assign them in Shopify. | `condition_grade` metafield |
| **Catalog review** | 26 flagged records. | `src/data/catalog-review.json` |

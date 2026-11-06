# React gap analysis

Audit date: 2026-11-06. Offline/read-only source inspection; no application/PHP/SQL execution, database connection, deployment, archive extraction, or changes to React. Source root: `/Users/siddharthkulkarni/Downloads/RPS FE WS`. Paths below are relative to `TransferNow-20261030We5tBjjq/api (1)` unless stated otherwise. Snapshot status is not proof of current production deployment.

## Current baseline

Reviewed frontend/src pages, shared components, data/services.ts, App.tsx routing, public asset paths and IMPLEMENTATION.md. React already has responsive page scaffolds, route aliases, accessible menu/route focus, native videos and a disabled labeled contact form. `services` is an empty array and reviews remain an empty state. The old IMPLEMENTATION.md statement that CMS data is unavailable is now superseded by this audit; it was not edited because this task is documentation-only.

No npm build was rerun: no application code/dependency changes were made. No browser-based visual, accessibility or video playback tests were performed. Static presence checks do not prove visual equivalence. Original production accessibility/SEO flaws should not be faithfully reproduced.

| Page | Source view | Route | Recovered data | React component under src/pages unless shared | Media | Missing content/functionality | Backend dependency | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home | home/index.php | / | rp_banner 1; CMS 1–6/23; what_new | Home.tsx | Warehouse banner; CMS3 about, CMS5 story; 6 benefit images; video assets | Replace paraphrases, restore What Sets Us Apart, exact story/why-us, six benefits and real services; verify quote CTA | CMS/settings; quote/account flow | P0 |
| About | About_us/index.php | /about-us | CMS8–12 | About.tsx | DB image/image_path for each CMS section | Replace restoration notices; remove invented structure/copy where it differs; exact values/trust sections | CMS read only | P0 |
| Services | Services/index.php | /services | 4 active services; CMS22; 6 packaging rows | Services.tsx | Four services images, all present | Catalog empty; add original names/order/summary/cards and expandable packaging text | Public service read model | P0 |
| Service detail | Services/detail.php | /service-detail/:slug | services_field_1 for four active slugs | ServiceDetail.tsx | Exact service images | Typed template exists but no records; restore descriptions and reject unpublished slugs | Service-by-slug read model | P0 |
| Reviews | Reviews/index.php | /reviews | CMS14 + 4 active reviews | Reviews.tsx | Static quote.png/review.png | Replace empty state with verified text/rating/order; no submission required | Read-only approved testimonials | P0 |
| How It Works | About_us/how_it_works.php | /how-it-works | CMS1/2/15–18 | HowItWorks.tsx | English/Spanish MP4, poster | Step body missing; labels now confirmed; add captions/transcripts and playback QA | CMS read; video hosting | P0 |
| Contact | Contact_us/index.php | /contact-us | CMS19 + public config | Contact.tsx | DB Google map URL; no fabricated address | Restore sales phone/email/body, enable actual form only after API; map destination approval | Inquiry API, captcha, email | P0 |
| Terms | About_us/page.php | /terms-and-conditions | CMS20 | missing | Inner banner7 | Create legal page/footer link after legal approval | CMS read only | P0 |
| Privacy | About_us/policy.php | /privacy-policy | CMS21 | missing | Inner banner8 | Create legal page/footer link; align with actual data processing | CMS read only | P0 |
| Header/footer | _layout/navigation_header.php; footer.php | shared | logo, CMS7, config, services | Header.tsx/Footer.tsx | DB logo fields, footer logo | Restore CMS footer, real service links, newsletter, social/legal links; decide Sign In placement | Newsletter/auth/settings | P0/P1 |

## Four concrete detail URLs

- `/service-detail/parcel-shipping`
- `/service-detail/ltl-less-than-truckload-shipping`
- `/service-detail/full-truckload-shipping`
- `/service-detail/intermodal-global-shipping`

No status=2 service slug should be published. Details must apply the same publication rule as listings even if legacy direct lookup is weaker.

## SEO requirements by page

Every page: descriptive unique title, approved description, canonical path, indexability policy, internal links, meaningful headings/alt text, and crawlable content (prerendering/SSR decision). Home requires organization/contact metadata only from verified settings. About must reflect actual company text; Services/details must preserve slugs and descriptions; Reviews must not claim fabricated aggregate ratings; How It Works should gain accessible video metadata/transcripts; Contact must not emit the lorem-ipsum address; Terms/Privacy need canonical legal URLs and owner-reviewed effective information. CMS SEO fields are empty in this snapshot, so new approved metadata is needed rather than recovery claims.

## Supporting and uncertain routes

The full 148-entry configured route inventory is in PAGE_CONTENT_MAPPING.md. Login/register/reset, account quotes/invoices, upload and checkout are outside the current React implementation. Blog/news/products/gallery-like and unrelated routes are inherited/unverified: assess source/model/schema compatibility before deciding to rebuild. Some route targets are absent. They must not become launch requirements solely because a route line exists.

## Asset and content parity

All 38 nonempty active-public database media references checked exist in the source and React public directory. Filenames have been preserved; this does not mean all are currently rendered or correctly assigned. The source export's logo reference must be visually checked: the previously selected header asset contained TextaPal while the footer logo is correct. Keep the verified RPS logo until its actual record/image selection is reconciled. Unrelated copied media must not be displayed merely because it exists.

The two large language videos total roughly 545 MB; use preload=none and an appropriate streaming/CDN optimization strategy. Vite copies unused legacy assets, vendor demos and archives as well. Audit/allowlist the deployed output without removing the read-only originals.

## Verification remaining

Desktop/tablet/mobile viewport tests; long recovered text overflow; menu collapse; service detail deep links; legal/alias redirects; keyboard focus and screen reader; form validation/errors; video playback/captions; missing image behavior; CSP/security headers; performance budget; direct-route fallback and SEO rendering. Backend integration tests must use approved nonproduction services, not production data or live payments.

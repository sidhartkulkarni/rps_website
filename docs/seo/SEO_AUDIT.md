# Technical SEO audit and implementation — 2026-11-07

## Scope and provenance

Branch `feature/seo-optimization` starts at committed website backend `b623e43`, whose parent is production frontend baseline `37cfffd` (`website-v20261106-1`). That commit adds working form integration and backend; it does not include premium UI. Starting here preserves deployed backend work rather than reverting it. Backend files and premium branch reference remain unchanged. No deployments, commits, pushes, releases, infrastructure changes or real form submissions were performed.

Evidence: direct unauthenticated GET responses from public production URLs, local baseline source, seven legacy reports, and the built/previewed React application. Search-tool cached results showed old PHP markup and are **not** treated as current production evidence. Direct live GETs show React shells. Per-route status/title/robots/H1/OG/schema counts are in `LIVE_ROUTE_EVIDENCE.json`. No subscriber records, credentials or personal submissions were accessed.

## Prioritized findings

| Severity | URLs / reproducible evidence | Finding and disposition |
| --- | --- | --- |
| High | All 12 canonical routes; live GET HTML has zero H1, zero OG and zero JSON-LD; `index.html` root empty | Crawlers need JavaScript to see page content. Fixed locally with build-time rendering of full React content and browser hydration. No Node runtime on EC2 required. |
| High | `GET https://www.rapidpacknship.com/` = 200; apex canonical present | Duplicate host accessible. Host-level permanent normalization requires separate approval; no DNS/SSL/Nginx changes made. |
| Medium | `/about`, `/contact`, `/how-it-work`, `/terms-conditions` = 200 | React Navigate is not HTTP redirect. Reviewed permanent redirect map in REDIRECT_REVIEW.md. Preview enforces 308; production still awaits approved host changes. |
| Medium | `/about-us/` = 200, canonical `/about-us` | Slash duplicate. Preview normalization implemented; production finite-route mapping pending. |
| Medium | Home title `Home`, generic Services title; no social metadata on all pages | Improved supported page-specific descriptions/titles; Open Graph and canonical head generated statically and synchronized on client navigation. Service-specific names retained. |
| Medium | No structured data in initial production HTML | Organization/WebSite on canonical pages, BreadcrumbList on inner pages, Service on four service details. No address, offers, review ratings, geographic coverage or guarantees introduced. |
| Medium | Large hero/seal/inner-banner images; see asset inventory | Hero JPEG ~1.06 MiB, seal PNG 1.42 MiB, several inner banners 1.11 MiB each. Existing originals preserved; hero preload and intrinsic image dimensions added. Responsive compressed derivatives remain a future approved optimization. No field CWV result claimed. |
| Medium | How It Works original MP4s 234.35 and 310.92 MiB | Existing `preload=none`, controls and no autoplay retained/tested. Do not preload videos. Transcoding/adaptive delivery, captions/transcripts pending approval; native files preserved. |
| Medium | Recovered homepage/service claims; reviews/legal | Source existence is not operational verification. Keep existing content but do not amplify claims in schema. Reviews and legal pages retain noindex. Owner approval required for claims/attribution/legal text. |
| Low | Links between detail pages and inquiry | Added related-service links, Services inquiry CTA, service breadcrumb parent and clickable header phone/email. Existing forms/API contract preserved. |
| Pass | Unknown `/seo-audit-not-a-page` live GET = 404 | Do not regress to SPA root fallback. Built custom 404 is noindex/no canonical; local preview validates unknown pages and service slugs with real 404. Production custom error body requires optional host approval. |
| Pass | HTTP apex GET = 301, Location HTTPS apex | Existing HTTPS redirect correct in sampled response. No changes. |
| Pass | `/robots.txt` = 200 with Allow / and absolute sitemap; `/sitemap.xml` = 200, nine URLs | Existing scope accurate. Generation retained from typed metadata; strengthened assertions and meaningful content now shipped at each URL. No fabricated lastmod timestamps, priorities or hreflang. |

Reproduce live checks with `curl -sS -D - https://rapidpacknship.com/about` (do not follow redirects initially), then root/www/slash/unknown URLs above. Inspect raw HTML with View Source, not only browser Elements. Live evidence represents this audit's requests, not a guarantee about all CDN/geographic variants.

## Rendering, media and schema decisions

`npm run build` performs TypeScript/Vite compilation then prerenders 12 canonical routes, four compatibility alias shells and `404.html`. The same route components/data generate initial HTML and hydrate client behavior. Canonical pages contain meaningful headings, text, links and accessible form labels without JavaScript. Forms remain disabled until hydration and declare POST defensively so unhydrated HTML cannot submit personal information in URL queries. No-JS users receive a phone/email alternative notice. API URLs, JSON bodies, consent and idempotency behavior are unchanged.

Canonical host is HTTPS apex with no trailing slash except root. Metadata excludes query strings. Sitemap includes exactly nine indexable canonical pages; reviews and both legal pages remain excluded. Alias compatibility shells are noindex with destination canonicals; permanent redirects remain preferable. Unknown HTML has no canonical. Header/menu/footer remain shared and visually consistent; schema uses verified brand name/logo and existing service names, without unsupported LocalBusiness details. A physical address is not verified (legacy setting contains filler); displayed hours also need owner confirmation. No Review/AggregateRating schema is emitted.

All 32 media hashes remain unchanged. New image dimension data was read from original files; PublicImage supplies dimensions and asynchronous decoding while retaining alt text, existing lazy loading and CSS. Existing descriptive service/about alt text retained, decorative images retain empty alt. Hero remains a decorative CSS background paired with real H1 text; its original JPEG is preloaded only on Home. Videos remain user-initiated. Browser tests check all page widths at 390 and 1280 pixels; no overflow/hydration errors. Sample mobile Home and desktop Contact screenshots visually reviewed. This is not a full accessibility certification, cross-browser matrix, Lighthouse score or field CWV measurement. Lazy images outside the viewport can be blank in full-page screenshots until scrolled.

The unchanged CSS imports Google Fonts (Inter, Poppins, Urbanist) with display=swap. External stylesheet/font round trips and fallback metric shifts remain LCP/CLS risks; self-hosting/subsetting needs a reviewed asset/license plan. Current single JS bundle is approximately 309 kB raw / 97 kB gzip; prerendering improves initial content but does not eliminate hydration/INP cost. Do not infer field performance from bundle size.

## Validation and limits

Commands from repository root:

```sh
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend run validate:public
(cd frontend && npm run test:integration)
python3 -m unittest discover -s scripts/deployment -p 'test_*.py' -q
python3 scripts/check_repository.py
git diff --check
```

Browser tests use built Vite preview, not the development-only SSR renderer; mock API responses for form tests and never contact production mail. Assertions cover all 12 page routes, H1/alt/canonical/schema, no-JS initial content, mobile navigation, viewport overflow, redirects/404, no initial MP4 request and eight existing form success/failure scenarios. Static validation checks sitemap URL count, canonical uniqueness, initial HTML, internal links, labels, 32 media paths/hashes and JSON-LD syntax. Rich Results Test/Search Console validation requires a later approved deployment; no search ranking outcome is promised.

Local preview implements HTTP behavior only for testing; installing static files alone will not activate reviewed permanent redirects. Current production already returns true unknown-route 404. Static installer/package allowlists now explicitly permit `404.html` while retaining file-boundary checks and the expected 16 index shells. Eight deployment-helper tests cover this addition and existing safety checks. Build output/screenshots remain ignored under dist/artifacts, not Git candidates. Repository scan is heuristic, not a certification of absence of secrets.

## Remaining approvals and order

1. Review this static frontend change and existing form contract tests; approve release separately. Keep backend and premium UI unchanged.
2. Approve finite alias/slash/www redirect handling and optional custom 404 body in the website host configuration. No unrelated paths or API rewrites.
3. Approve legal text, testimonial attribution, hours and existing operational claims. Only then reconsider indexing or richer business data.
4. Approve compressed image/video derivatives and captions/transcripts while retaining originals; measure field CWV before/after.
5. Follow `CONTENT_AND_SEARCH_CONSOLE.md` for keyword mapping, five proposed guides, ownership verification and post-release monitoring. No new guides published.

## Built route metadata inventory

| URL | Title | H1 (primary text) | Description |
| --- | --- | --- | --- |
| /about-us | About Our Auction Shipping Team / Rapid Pack N Ship | About Us | Learn about Rapid Pack N Ship, our company story and our approach to packaging and shipping auction purchases. |
| /contact-us | Contact Us / Rapid Pack N Ship | Contact Us | Contact Rapid Pack N Ship about auction packaging, parcel shipping or freight. Call, email or send an inquiry with your shipment requirements. |
| /how-it-works | How It Works / Rapid Pack N Ship | How It Works | You Win It. We Pack It. We Ship It |
| / | Auction Packaging & Shipping / Rapid Pack N Ship | Fast, Reliable Auction Packaging and Shipping Services  | Packaging and shipping for auction purchases. Explore parcel, LTL, full truckload and intermodal shipping, or contact Rapid Pack N Ship about your shipment. |
| /privacy-policy | Privacy Policy / Rapid Pack N Ship | Privacy Policy | Privacy Policy — content awaiting approval. |
| /reviews | Reviews / Rapid Pack N Ship | Reviews | What Our Customers Say: |
| /service-detail/full-truckload-shipping | Full Truckload Shipping / Rapid Pack N Ship | Full Truckload Shipping | Dedicated truckload services for large shipments needing full capacity. |
| /service-detail/intermodal-global-shipping | Intermodal Global Shipping / Rapid Pack N Ship | Intermodal Global Shipping | Flexible international shipping combining land, sea, and air for efficient worldwide delivery. |
| /service-detail/ltl-less-than-truckload-shipping | LTL (Less Than Truckload) Shipping / Rapid Pack N Ship | LTL (Less Than Truckload) Shipping | Cost-effective shipping for medium loads that don’t require a full truck. |
| /service-detail/parcel-shipping | Parcel Shipping / Rapid Pack N Ship | Parcel Shipping | Secure, reliable, and affordable small package shipping. |
| /services | Packaging & Freight Shipping Services / Rapid Pack N Ship | Services | Explore parcel shipping, LTL freight, full truckload and intermodal global shipping, plus packaging options for auction purchases. |
| /terms-and-conditions | Terms of Use / Rapid Pack N Ship | Terms of Use | Terms of Use — content awaiting approval. |

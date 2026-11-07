# Public website implementation

React + TypeScript + Vite; React Router; static public pages plus a separate FastAPI contact/newsletter delivery service. No Admin/RDS connectivity, Admin duplication, payment processing, or legacy PHP/jQuery execution. Work remains confined to rps_website. No commit, push, deployment or source-backup deletion.

## Completed public content

The seven reports in `docs/legacy-audit/` are the source of truth. `scripts/import-audited-content.py` reads only the two public-content Markdown reports, never SQL or private source folders. It converts text/entity-encoded HTML into typed paragraph/list blocks; `Content.tsx` renders escaped React text nodes, never dangerouslySetInnerHTML. Names, slugs, testimonial text/ratings and record provenance are retained. Status=2 rows and account CMS record 24 are not imported.

- Home: recovered hero description/eyebrow, company story, six differentiators, four original services, Why Choose Us, original three process descriptions, contact information and footer conditions.
- About Us: CMS8–12 company story, vision, mission, core values and client-trust content with database-mapped original imagery. Lists have semantic markup.
- Services: all four active records in original order, original descriptions/images and links; all six packaging categories with native keyboard-accessible details/summary expansion where extra text exists.
- Service details: typed records render original descriptions in paragraphs; unknown or unpublished slugs show Not Found.
- Reviews: four active source records, exact attribution/text/ratings, descending ID order. No stock portrait is claimed as a real reviewer. A verification notice remains because CMS14 explicitly requests real reviews; no aggregate-rating claims or structured ratings added.
- How It Works: CMS16–18 descriptions, original English/Spanish videos/poster, native controls and preload=none. Captions/transcripts remain missing.
- Contact: recovered 469-732-4444, sales@rapidpacknship.com, business hours and CMS19 introduction. Name/Email/Subject/Message fields submit to `/api/website/contact` with validation, loading/success/error states and in-memory retry keys. Delivery is fail-closed until SMTP is configured. Call/mail links work.
- Footer: original public navigation, real service links, legal URLs, business contact and CMS7 guarantee qualification. Newsletter subscription requests submit to `/api/website/newsletter`; enrollment still requires confirmation and a mailing-list workflow. Account access remains unavailable.

## Routes

| Route | State |
| --- | --- |
| `/` | Complete supported homepage content |
| `/about-us` | Recovered About content |
| `/services` | Four services and six packaging categories |
| `/service-detail/parcel-shipping` | Original service record |
| `/service-detail/ltl-less-than-truckload-shipping` | Original service record |
| `/service-detail/full-truckload-shipping` | Original service record |
| `/service-detail/intermodal-global-shipping` | Original service record |
| `/reviews` | Source testimonials; verification notice and noindex |
| `/how-it-works` | Original steps and language videos |
| `/contact-us` | Recovered contact information; FastAPI inquiry form |
| `/terms-and-conditions` | Explicit unavailable-content notice; noindex |
| `/privacy-policy` | Explicit unavailable-content notice; noindex |

Aliases `/about`, `/contact`, `/how-it-work`, `/terms-conditions` redirect to their canonical routes. Other routes, including unverified account/legacy modules, are not implemented.

## Source defects and client approval

Publication status in the recovered database does not establish accuracy. The earlier audit's description of all active text as recoverable public copy was too broad: the actual report bodies contain these defects.

1. CMS20/21 are **Lorem Ipsum**, not legal policies. Their original URL/banner structure is restored, but fake legal text is not published. Client-approved Terms/Privacy are launch blockers. Both routes are noindex and excluded from sitemap until substantive policies are supplied.
2. CMS14 says “I want real reviews and can supply leads once the website is operational.” That editing note is omitted. The four requested active testimonials are reproduced with a visible verification notice; Reviews is noindex and excluded from sitemap until authenticity/attribution approval. Do not remove the notice merely because the database status is 1.
3. Custom Packaging includes an internal medical-equipment editing instruction. It is omitted; the supported introduction remains (dangling “Examples include:” removed). No medical service claim was invented.
4. Domestic Shipping includes “Guaranteed delivery windows* (Add the asterisk)” without terms. The entire unresolved guarantee bullet is withheld; the other recovered bullets remain.
5. CMS6 has unrelated “Central Cargo / Dubai” location text; configuration address is Lorem Ipsum. Neither is published, and the unverified map/social destinations are omitted. Confirm an actual public address/map/social profiles before adding them.
6. Recovered claims about up-to-60% savings, same-day/24-hour dispatch, full-value insurance, worldwide coverage, partner carriers, decades of experience and shipment volume require current client confirmation. They are original source claims, not independently verified by this implementation. The original gold seal is retained alongside CMS7's qualification in the footer; confirm guarantee terms before launch.
7. Dedicated header logo and square favicon remain desirable. The supplied header logo contains TextaPal; both header/footer use the visually verified RPS footer logo. Asset names were preserved.
8. Recovered CMS SEO fields were empty. Titles use original page names; descriptions derive from recovered content or labels. HTTPS canonical origin `https://rapidpacknship.com` uses the recovered public domain; confirm final www/non-www policy with hosting.

## Architecture and metadata

- `src/data/content.ts`: typed public CMS, packaging, testimonials, benefits and banner mappings.
- `src/data/services.ts`: four typed service records with structured descriptions.
- `src/data/seo.ts`: route metadata, canonical origin, indexability and aliases; shared by client and build.
- `src/pages`: page composition; `src/components`: layout/navigation/content/service/packaging components.
- `src/components/RoutePosition.tsx`: title/description/canonical/robots updates on navigation, route focus and anchor scrolling.
- `vite.config.ts`: generates route-specific HTML shells with titles/descriptions/canonicals/robots for all 12 routes and four aliases; generates robots.txt and sitemap.xml. Sitemap includes nine indexable substantive URLs; Reviews and legal notices are intentionally excluded. No guessed last-modified dates.

Route HTML contains metadata before JavaScript executes, but page bodies remain client-rendered; this is not full SSR/prerendered body content. Production must serve the generated per-route index files for known deep URLs and return a proper 404 for unmatched URLs; see the host Nginx handoff in `../docs/deployment/EC2_STATIC_WEBSITE.md`. Unknown routes receive noindex after client navigation. Server-side redirect/status configuration remains a hosting task.

## Public asset isolation

Audited 5,055 existing files under public. Identified 2,344 legacy JS files, 22 PHP samples/handlers and 23 ZIP archives. The uploads/product directory is potentially private/unverified; filenames and customer data were not printed. Its contents were not approved for publication. No claim is made that every retained original image was manually inspected for private information.

`publicDir: false` disables Vite's blanket public exposure/copy. `public-assets.json` explicitly permits **32 original public media files**. A Vite-only media plugin serves those paths during development with MIME headers and video byte-range support and copies exactly those files to dist. It does not provide a production Node API. Vite filesystem deny rules also block original public/views/private-backup paths, SQL and PHP. Legacy URLs receive 404; direct filesystem access to originals receives 403.

Deployment preparation preserved all originals: 32 approved media remain under public and 5,023 unapproved files were moved intact to ignored `local-private-assets/legacy-public`. No originals/backups were deleted. Deploy **dist only**, never repository root or frontend/public. The generated dist directory was rebuilt, replacing the previous artifact that contained legacy assets. Original filenames/URLs of approved media are preserved. No SQL, keys, user uploads or legacy scripts are loaded into the app. Future asset additions require manifest review; `scripts/collect-public-assets.py` produces the candidate manifest from explicit media references and checks path/type restrictions.

## Validation

- `npm run build`: passed, including TypeScript; no dependency additions.
- `npm run validate:public`: passed. Server-rendered checks (not browser tests) cover all 12 routes, four service records, testimonial attribution/ratings, internal links, one h1 per page, image alt attributes, submission form labels/live status, static canonical/indexability metadata, sitemap and 32 approved asset references/output isolation.
- `node scripts/validate-public-site.mjs --http`: passed using a temporary localhost Vite server, closed afterward. Checked blocked legacy/private URLs and direct filesystem access, approved image response and valid/invalid video byte ranges. No external services were contacted.
- No browser viewport/screen-reader/video-playback QA was performed in this pass. Still manually verify desktop/tablet/mobile layouts, long recovered copy and image cropping, Tab/Shift+Tab/Escape and disclosures, route focus/aliases, video playback and captions, 200% zoom, font fallback and hosting redirects/status behavior.

## Remaining integrations

Contact and newsletter request endpoints are implemented; default local delivery returns 503 honestly. Quote submission, account authentication, tracking, checkout and payment remain unavailable. No Admin behavior was duplicated. Production SMTP, newsletter enrollment/opt-out, and infrastructure configuration remain pending; see `../backend/README.md`. Google Fonts remain an external font dependency with local system fallbacks. The two original videos are large (~545 MiB combined); transcodes/captions/CDN delivery remain optimization/accessibility tasks.

## Website backend integration — 2026-11-06

- New modular `backend/app` provides GET health and POST contact/newsletter under `/api/website`. Pydantic validates fields/email; extra fields rejected. POSTs need a UUID Idempotency-Key and JSON, with 16 KB limit, origin restrictions, honeypot and metadata-backed quotas.
- SMTP adapter uses verified STARTTLS and fixed destination; default disabled adapter never claims success. Newsletter is a subscription request, not confirmed list membership. No private message bodies are persisted locally or logged.
- External SQLite holds only HMAC fingerprints, state, timestamps and random IDs. Seven-day replay window; uncertain deliveries block automatic retry. Single-host shared-disk deployment only. Production still needs proxy limits including malformed requests, stable secret, private durable ledger, working SMTP and operator delivery monitoring.
- Shared `SubmissionForm.tsx` integrates both forms, labels required fields, announces status, disables duplicate clicks and retains failed form values in memory. Vite proxies API calls to loopback port 8001; production uses same origin. Existing unfinished quote/account/payment features remain unavailable.
- ESLint excludes preserved legacy `public`/`views` reference files; they are not application source and are still excluded from the served/build asset boundary. Original files were not deleted.
- Validation commands: backend `.venv/bin/python -m pytest -q`; frontend `npm run build`, `npm run validate:public`, `npm run lint`. Backend tests exercise delivery mocks, validation, provider failure/uncertainty, replay/concurrency, throttles, CORS, size/content type, production config and privacy redaction. Actual SMTP, viewport/keyboard/screen-reader browser submission tests and deployment are not performed.
- Approved privacy/retention policies remain required before production collection. Setup, API contract and remaining deployment requirements are in `../backend/README.md`.

Final verification for this pass: 24 backend tests passed (one upstream Starlette/httpx test-client deprecation warning); frontend build, 12-route public validation and ESLint passed. `pip check` found no broken requirements. No real provider credentials or browser-based form interaction were used.

## Static deployment preparation

- Root `.gitignore` excludes private/local archives, legacy views, SQL/data exports, credentials/environment files, dependencies, runtime databases and artifacts. `frontend/public/.gitignore` permits only the 30 approved non-video files; the two approved large videos are preserved locally and distributed separately via reviewed GitHub Release assets.
- All 32 original media paths/bytes are pinned in `public-assets.lock.json`. `scripts/check_repository.py` verifies hashes, public-directory contents and Git candidates with a heuristic credential scan. It is not a substitute for manual staged-content review.
- `scripts/deployment/` provides hash-checked media recovery, local clean-commit builds, compiled-only packaging, archive verification and separately invoked EC2 staging. No source/dependencies/backend enter the web artifact. Activation is an explicit operator step; no Nginx/EC2/Admin changes are automated or performed.
- Current artifact: 52 files, ~561.1 MiB, including all 12 canonical route shells, four aliases, JS/CSS, sitemap/robots and 32 media files. A nonpublishable local preview was verified; the repository has no commits and nothing was pushed/released.
- Build, lint and public validation passed after asset isolation. Host capacity, domain/TLS/Nginx coexistence, source/media/publication rights, approved legal content and separate API deployment remain approval prerequisites. Exact commands and rollback guidance: `../docs/deployment/EC2_STATIC_WEBSITE.md`.


## Website backend completion — 2026-11-07

On `feature/website-backend-production`, production-baseline contact/newsletter integration now includes bounded TLS SMTP, safe retries, dependency readiness and encrypted double opt-in/unsubscribe. Newsletter intake success means confirmation email accepted; membership requires explicit confirmation. Forms handle validation/unavailability/uncertain delivery without false success. No premium UI or production deployment changes.

Validated: 41 backend tests, 8 browser integration tests, 7 deployment-helper tests, frontend build/lint and 12-route/32-asset validation. Remaining P0: approved SMTP configuration and controlled delivery verification, privacy/retention approval, host resource/port checks, dependency advisory review, isolated service/proxy approval. P1: approved campaign delivery that honors active state/unsubscribe; no campaign sender or subscriber admin UI exists. See `docs/integration/WEBSITE_BACKEND_PRODUCTION.md` and `docs/deployment/WEBSITE_BACKEND_EC2.md` from repository root. This entry supersedes earlier descriptions of newsletter as inbox-only or health as configuration-only.


## Technical SEO — local branch feature/seo-optimization

Build now prerenders all 12 canonical React pages and hydrates existing forms/navigation, retaining the static EC2 deployment model. Metadata includes canonical/robots/Open Graph and conservative Organization/WebSite/BreadcrumbList/Service JSON-LD. Nine indexable canonical URLs remain in sitemap; reviews/legal await approval. Original 32 media hashes are preserved. Form fields stay disabled before hydration to prevent accidental native submissions; API contracts are unchanged.

`npm run build` must complete its prerender step before packaging/testing. Browser tests now run built preview. Preview models permanent aliases and real 404; production redirects require separate approved host work. See `docs/seo/SEO_AUDIT.md`, `REDIRECT_REVIEW.md`, `CONTENT_AND_SEARCH_CONSOLE.md` and `CHANGE_SUMMARY.md` from repository root. Backend/premium UI untouched; no deployment performed.

## Header animation and public phone — 2026-11-08

Restored the original recovered header mascot GIF with the legacy 2.5s movement/2.9s reveal, respecting reduced motion and preserving linked-logo geometry. Public phone is centralized as 866-959-7447 / tel:+18669597447. All 32 prior media remain unchanged; allowlist now includes the reviewed original header GIF (33 assets). Build/lint, 18 browser tests, route/SEO/phone validation and security checks passed. See `docs/seo/LOGO_AND_PHONE_UPDATE.md` from repository root for provenance and exact changes. No production deployment performed.

## Optional analytics — 2026-11-08

Added consent-gated GTM `GTM-KM945ZXM` using the current container snippet held inert in the shared HTML template. No separate GA4 loader. GA4 `G-X9QN5W2GTB` requires the reviewed Google-side setup in `docs/analytics/GTM_GA4_SETUP.md` before publishing. Analytics defaults off; Accept/Reject/preferences persist, withdrawal unloads tags through a reload, and forms work with either choice. Fixed allowlisted events cover manual SPA page views, confirmed contact request success, newsletter requests (not signups), phone/email and explicit quote/contact CTAs. API/token/unrecognized/query-bearing URLs are excluded; no form data or raw URLs are sent by event helpers. Local replay suppression is best-effort and does not replace backend idempotency.

The privacy page now contains a factual implementation notice, explicitly awaiting Mark's legal approval. No Google container, backend or infrastructure was modified, and no live Google ingestion or production delivery was tested. Existing logo, phone, assets, SEO and forms remain intact. See the analytics guide for exact files, triggers, consent template requirements, Tag Assistant/DebugView checks and limitations.


## Informational privacy toast — 2026-11-08

Supersedes the earlier banner UI: a compact bottom-left notice fades away after about five seconds, once per browser when storage is available. Hover/focus pauses dismissal; reduced-motion is respected. The independent seen marker never grants consent. Footer Privacy Settings provides persistent opt-in/opt-out controls. GPC overrides acceptance, saved rejections do not expire, and acceptance still expires after 180 days. All five events, SPA deduplication, forms, SEO, mascot and phone remain intact.

Analytics remains off by default globally pending Mark/legal approval of any regional default-on policy and a trustworthy jurisdiction signal. No location inference or infrastructure changes were added. See `docs/analytics/PRIVACY_NOTICE.md` for the behavior matrix, exact files, verification and unresolved approvals; Google-side configuration remains governed by `GTM_GA4_SETUP.md`.

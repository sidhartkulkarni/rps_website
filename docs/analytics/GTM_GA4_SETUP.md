# GTM / GA4 integration — 2026-11-08

Website: https://rapidpacknship.com · GTM: `GTM-KM945ZXM` · GA4: `G-X9QN5W2GTB`.

**Local implementation only. No Google account configuration, container publishing, site deployment or production mail submission was performed. Do not enable this release against an unreviewed container. Mark must approve privacy wording and the Google configuration below.** Backend, Admin/mobile and infrastructure remain untouched.

## Audit and installation

Searched frontend source, shared HTML, Vite configuration and route-generated shells for GTM, gtag, analytics, dataLayer and consent storage. No existing analytics installation or analytics consent mechanism was found. Newsletter consent is a distinct subscription requirement and is not analytics consent. Existing Google Fonts are not an analytics integration; those requests remain outside this change.

Google's current web-container guide uses an async `gtm.js?id=...` script followed by the dataLayer/`gtag('js', new Date())` bootstrap. The previous iframe/noscript snippet is explicitly identified as the older version. The current snippet is present once inside an **inert template high in the shared HTML head**, copied into all generated shells. Application code initializes it once only after analytics consent. This intentional gating differs from unconditional installation and follows the basic-consent objective of no Google tag requests before acceptance. No `gtag/js` GA4 loader or noscript iframe is installed. JavaScript-disabled visitors cannot opt into tracking and make no tag request.

Sources reviewed: [Google container installation](https://support.google.com/tagmanager/answer/14847097?hl=en), [basic versus advanced consent](https://developers.google.com/tag-platform/security/concepts/consent-mode), [Tag Manager consent APIs](https://developers.google.com/tag-platform/security/guides/consent), [consent debugging](https://developers.google.com/tag-platform/security/guides/consent-debugging).

## Consent behavior

- Optional analytics defaults off globally. An informational five-second toast replaces the consent banner; displaying/dismissing it never grants consent. Persistent footer Privacy Settings opens the keyboard-accessible preferences dialog with an opt-in checkbox and rejection control. GPC overrides acceptance. Advertising remains off. See [privacy decision matrix and approval blockers](PRIVACY_NOTICE.md).
- Only a versioned analytics boolean and timestamp are stored in `rps.analytics-consent.v1`, with 180-day validity for acceptance; explicit rejection does not expire automatically. No names, form values or tokens are stored there. Blocked/invalid/expired storage defaults off. If storage is unavailable, acceptance works in memory for the document; reload defaults off again; Privacy Settings remains available.
- No page/event backlog exists before consent. Acceptance measures only the current eligible page, not earlier views/conversions.
- Withdrawal sets GA's disable flag, removes known first-party `_ga` cookies, and reloads with rejection persisted. This removes installed third-party listeners rather than pretending script removal unloads them. The preferences dialog warns that reload can discard unfinished form input. Cross-tab storage rejection also causes an already-loaded tab to stop/reload.
- Native dialog supports Escape/focus restoration; controls have labels, focus styles and no animation dependencies. Logo reduced-motion behavior is unchanged.
- Preference storage and local session replay hashes need disclosure approval. This is a custom basic-consent implementation, not a certified CMP or a claim of legal compliance.

## Sanitized event contract

Only fixed event names plus `page_location`, `page_title` and empty `page_referrer` are sent by application event helpers. Locations/titles come from typed static route metadata, never arbitrary DOM text or raw URL. The initialized data layer also sets `rps_analytics_allowed=true` for container gating. Neither form data nor response IDs enter the data layer. GTM's bootstrap timestamp is the only extra startup command.

| dataLayer event | Trigger | GA4 event name |
| --- | --- | --- |
| `analytics_page_view` | Eligible canonical page after consent, then actual SPA path changes; repeat effects/same-path clicks suppressed | `page_view` |
| `generate_lead` | Contact API returns success with `status=delivered` and a UUID response ID not previously observed locally | `generate_lead` |
| `newsletter_request` | Newsletter API returns delivered confirmation-request response, locally deduplicated | `newsletter_request` |
| `click_to_call` | Exact approved public tel link clicked | `click_to_call` |
| `click_email` | Exact allowlisted business mailto link clicked | `click_email` |
| `quote_cta_click` | Explicitly annotated quote/contact CTA clicked | `quote_cta_click` |

No email address, phone number, name, subject, message, SMTP field, form label/input, request ID, user ID, subscriber token or confirmation URL is attached. Newsletter request is **not** `sign_up` and must not be reported as a confirmed subscriber. Clicks indicate intent, not delivered inquiries.

Only exact known canonical frontend paths are eligible. Unknown routes, aliases before resolution, API and newsletter token/action paths are excluded. All query-bearing URLs and unrecognized fragments block loading/events even after consent. Five existing safe section anchors are allowed but omitted from payloads. If an already-loaded SPA navigates to a sensitive/unknown URL, it disables GA and reloads to unload listeners. The shared document and GTM request use no-referrer policy. This deliberately sacrifices UTM/query attribution; do not loosen this safeguard without a new privacy review.

GA intrinsically processes browser/network information and can create pseudonymous client/session cookies after acceptance. We do not set customer IDs, User-ID or user-provided data. Google-side automatic collection must be configured as below; the repository cannot prevent an administrator from later publishing arbitrary tags that read DOM/URLs. Real network-payload validation is a mandatory release gate.

## Duplicate and failure limitations

The API returns the same success shape for first delivery and an idempotent replay. It has no replay flag. Within a document, repeated response IDs are suppressed. After consent, SHA-256 digests of the request-kind/UUID are stored in sessionStorage (last 500) for suppression after same-tab reload. Raw IDs never leave the browser through analytics. Missing/malformed response IDs, non-success responses, failures and uncertain delivery produce no conversion event. Success before consent is not replayed after acceptance in the same document.

This cannot identify a replay first observed in a different tab/device, after cleared/blocked sessionStorage, after the bounded history is evicted, or from a previous document where analytics was rejected. It cannot distinguish distinct API UUIDs representing the same real inquiry. No backend/API change was made. GA deduplication must not be claimed as exactly-once lead accounting. Do not send API request IDs to Google to solve this limitation.

## Required Google interface configuration — draft only

Use the existing container workspace; audit/remove duplicate Google tags, GA4 config/event tags and automatic conversion rules before adding anything. Do not publish as part of this task.

1. Create Data Layer Variables (version 2): `rps_analytics_allowed`, `page_location`, `page_title`, `page_referrer`. Do **not** enable/use Form variables, Click Text, Click URL, Page URL, Referrer, DOM text, user-provided data or arbitrary query variables in tags.
2. Add a reviewed custom consent template using the sandboxed APIs `setDefaultConsentState`, `updateConsentState` and `copyFromDataLayer`. Fire it on **Consent Initialization – All Pages**, before Google tags. Defaults: `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` all denied. Then synchronously update analytics_storage to granted **only if** `copyFromDataLayer('rps_analytics_allowed') === true`; keep all three advertising types denied. Grant only the minimum template permissions (read this one data-layer key and write these consent types). Do not use a Custom HTML tag or queued gtag consent command for this task. The container is only loaded after app consent, so no denied-consent ping is needed before acceptance. Rejection/withdrawal unloads the container; no container-side banner is required.
3. Create exactly one **Google tag** for `G-X9QN5W2GTB`. Trigger Initialization only when `rps_analytics_allowed` equals boolean true, require `analytics_storage`. Configuration: `send_page_view=false`, `allow_google_signals=false`, `allow_ad_personalization_signals=false`. Set page_location/page_title/page_referrer from the sanitized variables (referrer intentionally empty). Do not let them fall back to built-in raw URL/referrer variables. No independent GA script in the site.
4. Disable GA4 Enhanced Measurement automatic page/history views, outbound clicks, form interactions, file downloads, site search and video tracking for this stream. Disable automatic user-provided data, Google signals, ads personalization and any automatic form/lead mappings. Do not add GTM History Change, All Links or All Forms triggers. There must be only the custom pageview path below.
5. Create one Custom Event trigger for each row above, exact match, with additional condition `rps_analytics_allowed === true`. Create six GA4 Event tags using the corresponding GA4 event name and measurement ID. Require analytics_storage on every tag. Send only sanitized page_location, page_title and empty page_referrer; no event/user properties from form fields, click targets, URL fragments or customer IDs. Use the Google tag as the shared configuration; confirm it initializes before event tags (use tag sequencing if the workspace configuration requires it).
6. Mark only `generate_lead` as a lead key event if Mark approves. Keep newsletter_request as a request metric; no confirmed signup claim. Do not mark every click as a lead. GA4 can emit its own first_visit/session_start/user_engagement after consent; verify their URL/referrer configuration too.
7. Approve retention, access roles, IP/network processing disclosures, jurisdictional requirements and data-sharing settings. Do not link Ads accounts or enable remarketing under this task. No campaign/customer identity imports.

## Tag Assistant and GA4 DebugView verification

Perform only in a reviewed staging/local preview with authorized account access and synthetic data. Automated repository tests intercept GTM with an inert script; they do **not** validate the live container or Google ingestion.

1. Start `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 5191`. Connect GTM Preview/Tag Assistant using a **clean URL**. Turn off adding a debug query parameter if the interface offers that option; the application intentionally blocks any query-bearing URL. Never put subscriber tokens or customer information into a debug URL.
2. Fresh browser/storage: inspect Network. No gtm.js, gtag.js, collect requests or GA cookies before selection. Reject and reload: still none; forms remain usable. Google Fonts may load independently and are not evidence of analytics loading.
3. Accept: exactly one GTM request and one manual page_view. Consent tab must show analytics granted and all advertising denied before Google tags fire. Verify no extra automatic initial page_view. Navigate Home → Services → a detail → Contact; one view per transition, none for a repeated same-path click.
4. In GA4 DebugView, enable debug_mode only for the controlled preview environment (not permanently for public traffic). Verify fixed event names and sanitized canonical page_location/title, empty page_referrer. Inspect all actual collect payloads, including first_visit/session_start/user_engagement, for query/fragment/contact information. Do not attach screenshots of payloads containing private information to reports.
5. Test business phone/email/quote CTA actions: one intent event each, no destination/contact text sent. Use mocked API success/failure or an explicitly approved synthetic inquiry to test conversions. Failures/uncertain results must not count; same returned UUID twice must count once. Newsletter request must remain distinct from signup.
6. Visit a query-bearing page, token fragment, unknown route and API action path: no tag load/events on entry; test sensitive client navigation after acceptance too. Actual backend confirmation/unsubscribe pages have no React/GTM inclusion and remain unmodified.
7. Reopen preferences by keyboard, cancel/Escape, then reject: reload, no subsequent tags, known GA cookies removed. Check mobile layout and reduced motion. Test blocked storage and expired consent.
8. Publish only after Mark approves legal/configuration details and the tag audit proves no automatic/raw data capture. A Google container publish and website deployment are separate approvals; neither happened here. Monitor event counts and accepted inquiries for discrepancies, without treating GA as the operational source of truth.

## Files changed for analytics

- `frontend/index.html`: inert current GTM snippet and no-referrer policy shared by generated pages.
- `frontend/src/analytics/tracking.ts`: consent storage, exact-route gating, container initialization, sanitized events and local replay suppression.
- `frontend/src/components/Analytics.tsx`: SPA pageviews and allowlisted click handling.
- `frontend/src/components/AnalyticsConsent.tsx`: consent banner and persistent accessible preference dialog.
- `frontend/src/components/SiteLayout.tsx`: analytics lifecycle coordinator.
- `frontend/src/components/Footer.tsx`: persistent analytics controls.
- `frontend/src/components/SubmissionForm.tsx`: post-success event hook only; API contract unchanged.
- `frontend/src/pages/Home.tsx`, `frontend/src/pages/Services.tsx`, `frontend/src/pages/ServiceDetail.tsx`, `frontend/src/components/ContactSection.tsx`: explicit CTA markers.
- `frontend/src/pages/Legal.tsx`: factual implementation notice, explicitly awaiting Mark's legal approval.
- `frontend/src/App.css`: consent banner/dialog layout and accessible controls.
- `frontend/tests/analytics.spec.ts`: consent/privacy/event regressions with mocked Google network.
- `frontend/tests/submissions.spec.ts`, `frontend/tests/seo.spec.ts`, `frontend/tests/brand-contact.spec.ts`: run existing nonanalytics scenarios with explicit rejected preferences.
- `frontend/scripts/validate-public-site.mjs`: generated-shell GTM uniqueness/inertness/no separate GA loader checks.
- `frontend/IMPLEMENTATION.md`: analytics status and operational prerequisites.
- `docs/analytics/GTM_GA4_SETUP.md`: this audit, configuration procedure, limitations and results.

Earlier uncommitted logo/phone work remains intact. All original approved assets, routes, metadata, working form contracts and restored motion remain preserved.

## Final local validation results

- Production frontend build, ESLint and route/SEO validator passed: 12 canonical pages, four aliases, nine sitemap URLs, correct canonical/schema metadata, all 33 asset hashes and current public telephone links.
- Generated canonical HTML has exactly one inert GTM snippet, no independent GA4 loader and no noscript consent bypass.
- **29 Chromium tests passed**: 11 analytics/consent scenarios plus 18 existing logo, phone, SEO and contact/newsletter scenarios. Includes acceptance/rejection/withdrawal, expired/blocked storage, SPA pageview deduplication, replay suppression, failure exclusions, sanitized event payloads, API/query/token exclusions and mobile preferences.
- Mobile consent/preferences screenshots visually inspected. Corrected an inherited footer heading-color conflict and added explicit contrast-color regression assertions. Native dialog Escape/focus restoration verified.
- **9 deployment-helper tests passed**. Repository security/asset scan and `git diff --check` passed. Security scan is heuristic, not certification.
- No backend file changes. Premium reference remains `92a9dc3`. No new dependencies, media changes or production actions for analytics.

**Release blockers:** Mark's final privacy/retention approval; authorized audit/configuration of the actual GTM container and GA4 property; Tag Assistant/DebugView and real collect-payload verification in a controlled environment. Browser tests replace Google with an inert script and do not prove the unpublished/current live container is safe. No account credentials were accessed. No Google workspace/container changes were published. Existing deployment/redirect approvals remain separate.

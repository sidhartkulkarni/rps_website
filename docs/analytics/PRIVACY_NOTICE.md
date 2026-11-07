# Privacy notification update — 2026-11-08

Local work on `feature/seo-optimization`. No deployment, publishing, backend changes or Google workspace changes.

## Implemented behavior

The full-width banner is removed. A bottom-left, 350px maximum-width notice reads “We use analytics to improve our website. Privacy settings.” It fades in/out over 200ms, disappears after approximately five seconds, and has an immediate dismiss button. Focus or hover pauses dismissal and gives another five seconds when interaction ends. Reduced motion removes animation. No focus is stolen, dismissal restores focus when necessary, and the native settings dialog supports Escape. Footer Privacy Settings remains available after the notice disappears. Scrolling that footer control into view also hides the toast so it cannot cover the control.

`rps.privacy-notice.v1=seen` remembers display independently from consent. It contains no identifier. This marker never grants permission. With blocked storage, the notice appears at most once per document/SPA session; a new full load may show it again. Clearing storage or changing browsers also resets it. Storage disclosure requires approval.

## Current privacy decision matrix

| Visitor/browser situation | Effective analytics behavior |
| --- | --- |
| US visitor without a recorded choice (any state) | Off pending explicit opt-in; default-on has NOT been approved or enabled |
| Unknown location or location requiring prior consent | Off pending explicit opt-in |
| Current explicit acceptance, no GPC, eligible canonical URL | GTM loads; manual page views and five existing events remain enabled |
| Expired acceptance (180 days) | Off until renewed through Privacy Settings |
| Explicit rejection, including one older than 180 days | Off; rejection has no automatic expiry |
| GPC enabled, even with prior acceptance | Off; preference checkbox disabled; no analytics requests/events |
| GPC becomes enabled after tracking loaded | Disabled and document reloaded on focus/visibility or next tracking action |
| Unknown/query/token-bearing URL | No analytics, even with acceptance |
| Missing/corrupt/unavailable preference storage | Off; explicit choice can work in document memory |
| Notice shown, timed out or dismissed | No change to analytics permission |

This release intentionally uses one conservative consent-required policy globally. It does not identify states using language, timezone or inferred location. There is no approved jurisdiction policy or trusted country/state resolver in this static website. Default-on in eligible US jurisdictions remains **blocked pending Mark/legal approval and a reviewed jurisdiction mechanism**; it is not silently enabled for all US visitors. The notice is not a consent mechanism.

GPC is read from `navigator.globalPrivacyControl`. The JavaScript application cannot inspect the incoming `Sec-GPC` HTTP request header; header-only signals would require separately approved host/edge support. No infrastructure changes were made. There is no standard GPC change event; checks occur before application tracking and on focus/visibility, so continuous background detection is not claimed. This implementation conservatively disables all optional analytics under GPC, without claiming that all analytics legally constitutes sale/sharing.

California describes rights to opt out of sale/sharing, including through GPC. Colorado recognizes GPC for covered businesses' sale/targeted-advertising opt-outs. Applicability and analytics classification require business/legal review, not an assumption that serving US visitors removes privacy obligations. Sources: [California Attorney General](https://oag.ca.gov/privacy/ccpa), [Colorado Attorney General](https://coag.gov/opt-out/).

## Required approvals before production

- Mark/legal: accurate final privacy policy, applicable state/non-US obligations, analytics purpose/legal basis, retention, browser preference storage, and the short notification text in context. Existing policy is explicitly an implementation notice, not approved legal wording.
- Mark/legal: whether any visitors may use default-on analytics; exact eligible jurisdictions, trustworthy resolution and conservative unknown-location fallback. No default-on switch ships in this change.
- Google configuration review: retain `ad_storage`, `ad_user_data`, `ad_personalization` denied; disable Google Signals, advertising personalization, user-provided data, Ads linking and advertising-related sharing. Google account data-sharing settings must also be reviewed. Do not add advertising tags without separate approval.
- Verify the actual container follows `GTM_GA4_SETUP.md`, including manual-only page views and sanitized event variables. Application code cannot prevent an administrator from publishing arbitrary scripts in GTM.
- Run controlled Tag Assistant/DebugView and network inspection against the reviewed container before release. Browser tests substitute inert Google responses; they do not establish live Google-account configuration or legal compliance.

## Files changed for this update

- `frontend/src/components/AnalyticsConsent.tsx`: toast lifecycle, separate seen marker, accessible persistent Privacy Settings and GPC explanation.
- `frontend/src/App.css`: replace banner rules with compact responsive toast, fade/reduced-motion and scoped dialog styles.
- `frontend/src/analytics/tracking.ts`: GPC precedence, persistent opt-outs, focus/visibility checks and denied-event unloading; event contracts and URL sanitization retained.
- `frontend/src/pages/Legal.tsx`: truthful disclosure of notice, GPC and preference lifetimes; approval warning retained.
- `frontend/tests/analytics.spec.ts`: updated dialog interactions plus desktop/mobile timeout, dismissal, focus, GPC and old opt-out coverage.
- `docs/analytics/GTM_GA4_SETUP.md`: current consent behavior and link to this approval matrix.
- `frontend/IMPLEMENTATION.md`: current implementation status.
- `docs/analytics/PRIVACY_NOTICE.md`: this change record.

Existing uncommitted SEO, phone, mascot and first analytics integration changes were preserved. No backend source, media assets or API contracts changed in this update.

## Validation results

- Frontend production build and lint: passed.
- Chromium browser suite: **35 passed**, including all five custom events, page-view deduplication, replay/failure handling, URL/PII exclusion, forms, SEO, logo/phone, GPC precedence and withdrawal, expired acceptance, persistent old rejection, storage failures and keyboard controls.
- Desktop 1280px and mobile 390px: actual screenshots visually reviewed; timeout/fade, reduced motion, focus pause and once-per-browser behavior exercised. Screenshots remain ignored under `artifacts/`.
- Public validator: 12 canonical route shells, metadata/schema/sitemap/links, current phone, inert GTM and 33 unchanged approved asset hashes passed.
- Deployment helper suite: **9 passed**.
- Repository heuristic security scan and `git diff --check`: passed. No backend diff. No commit/push/deploy performed.
- Google requests were mocked; no live ingestion/Google account settings or real geographic routing was tested. Regional default-on remains unimplemented pending the approvals above. This does not claim legal compliance or that a heuristic scan certifies absence of every possible secret.

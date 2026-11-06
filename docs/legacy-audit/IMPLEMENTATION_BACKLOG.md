# Implementation backlog

Audit date: 2026-11-06. Offline/read-only source inspection; no application/PHP/SQL execution, database connection, deployment, archive extraction, or changes to React. Source root: `/Users/siddharthkulkarni/Downloads/RPS FE WS`. Paths below are relative to `TransferNow-20261030We5tBjjq/api (1)` unless stated otherwise. Snapshot status is not proof of current production deployment.

Effort estimates are engineering person-days (1 day ≈ 6–8 focused hours), not calendar commitments. They assume one experienced React/FastAPI engineer, access to decisions/test environments, and exclude legal/provider approval delays. Ranges overlap where work can be shared; do not blindly sum them. This audit authorizes no implementation/deployment actions.

## P0 — Required for public website launch

| Task | Description / acceptance | Dependencies | Effort |
| --- | --- | --- | --- |
| P0-01 Content approval | Confirm snapshot authority, status=1 records, business claims, phone/email/map, logo, four testimonials and legal text; reject lorem-ipsum address | Owner/public content review; these reports | 0.5–2 days |
| P0-02 Public content model | Create typed, sanitized, versioned public data for CMS1–23, four services, six packaging rows, banners and benefits; no private dump copy | P0-01 | 1–3 days |
| P0-03 Home/About parity | Restore original sections/copy/media assignments and footer content while preserving accessibility | P0-02 | 2–4 days |
| P0-04 Services/details | Populate 4 canonical detail slugs, original summaries/descriptions, correct order and accessible packaging disclosure | P0-02 | 1–3 days |
| P0-05 Reviews/process | Restore 4 approved reviews and 3 process bodies; verify videos and accessibility; obtain captions | P0-01/02, caption source | 1–3 days plus transcription |
| P0-06 Contact launch | Approved public details, FastAPI inquiry endpoint, validation/anti-spam, delivery/persistence, honest status UI | Email/captcha test credentials, privacy/retention decisions | 2–5 days |
| P0-07 Legal/SEO/routes | Terms/Privacy, footer links, canonical aliases, unique metadata, sitemap/robots and prerender/SSR decision | Legal approval, canonical domain choice | 1–3 days |
| P0-08 Deployment asset isolation | Allowlist public media; exclude vendor PHP upload samples, archives, private uploads and unrelated scripts from deployed output; preserve original assets | Asset inventory, hosting plan | 1–2 days |
| P0-09 Security boundary | Review/rotate exposed live secrets through authorized process; secure session/CSRF/CORS controls; do not expose legacy test/admin/operational endpoints | Security/admin owner authorization, backend design | 2–5 days |
| P0-10 Launch QA | Responsive/a11y/keyboard, media, deep links, SEO output, link checking, form success/failure, privacy and performance checks | P0 implementation | 2–4 days |

If the business explicitly launches an informational-only site, P0-06 can remain clearly disabled with owner acceptance; it must not appear functional. Restore a safe quote/sign-in handoff only to a confirmed existing service, not guessed URLs.

## P1 — Required for original functionality parity

| Task | Description / acceptance | Dependencies | Effort |
| --- | --- | --- | --- |
| P1-01 Newsletter | Verified consent, deduplication, provider integration and unsubscribe lifecycle | Public settings, email provider, privacy approval | 1–3 days |
| P1-02 Authentication | Registration, email/phone OTP, login/reset/logout and secure device/session policy; rate/attempt limits | Identity ownership, provider sandbox, migration/reset plan | 5–10 days |
| P1-03 Quote workflow | Shipping addresses/items, create/list/detail quote UI/API, ownership and quote state transitions | P1-02; Admin schema/API contract | 4–8 days |
| P1-04 Invoice uploads | Authenticated scoped S3 uploads, size/type validation, malware policy, invoice parsing/lookup and attachment authorization | Storage IAM, Admin invoice API, P1-02/03 | 3–7 days |
| P1-05 Account/history | Profiles, quote/invoice/history views and required messaging; recover missing operational tables/contracts before coding | P1-02; Admin ownership decisions | 4–8 days |
| P1-06 Payments | Confirm actual gateway; checkout, signed webhooks, retries/idempotency, reconciliation and receipts; no legacy credential reuse | Provider/account approval, invoice/quote contract | 5–12 days |
| P1-07 Shipping/labels | Approved rate provider integration, tracking and PDF/barcode workflow adapter | Carrier API access, Admin state ownership | 3–8 days |
| P1-08 Integration/migration rehearsal | Nonproduction tests across auth/quotes/uploads/payments, explicit schema migrations and reconciliation; no raw dump import | P1 features, sanitized test fixtures | 3–6 days |

Do not automatically rebuild dormant blog/product/appointment/job modules or every payment provider. Confirm public business use first. Admin/warehouse API functionality should stay in its owning system unless explicitly commissioned for migration.

## P2 — Optional enhancements and modernization

| Task | Description | Dependencies | Effort |
| --- | --- | --- | --- |
| P2-01 Media delivery | Responsive WebP/AVIF variants, video transcodes/adaptive delivery, CDN caching | Approved originals, hosting budget | 2–5 days |
| P2-02 CMS authoring | Structured editor, revision/publishing workflow, preview and sanitization | Approved content model/auth roles | 5–12 days |
| P2-03 Observability | API tracing, delivery/payment alerts, error budgets, privacy-safe analytics | Runtime/retention decisions | 2–4 days |
| P2-04 Content enhancements | FAQ content, localization and improved public support flow only with approved copy | Product approval; no recovered FAQ records | 2–6 days |
| P2-05 Cleanup/deprecation | Remove obsolete routes/libraries from future deployment, document retention of reference backups | Parity verified, owner signoff | 1–3 days |

## Recommended sequence

Approve evidence → build sanitized content model → restore marketing pages/legal/SEO → secure contact delivery and deployable asset boundary → launch QA → establish Admin/auth contracts → quote/invoice workflows → payments/shipping → optional optimization. Update IMPLEMENTATION.md in the subsequent implementation change to replace its now-obsolete missing-data assumptions.

## Implementation status — verified static-content pass (2026-11-06)

This update supersedes earlier assumptions that all status=1 CMS content was publication-ready. No backend, database connection, deployment, or Admin implementation was introduced.

| Task | Status after this pass | Remaining / dependency | Remaining effort |
| --- | --- | --- | --- |
| P0-01 Content approval | Source review completed; substantive recovered content populated | Client approval of source claims; testimonial authenticity; actual legal policies; packaging guarantee terms; public map/social URLs | 0.5–2 days plus client/legal turnaround |
| P0-02 Public content model | Complete: typed text/list blocks, four services, six categories, four testimonials, benefits and banners; no raw HTML execution | Review future updates through public-only importer | 0–0.5 day |
| P0-03 Home/About | Complete supported copy/imagery, original story/mission/vision/values/trust, benefits and footer condition | Manual visual/a11y QA; approval of business claims | 0.5–1.5 days |
| P0-04 Services/details | Complete: all four original slugs, descriptions, images; six categories with native expansion | Client replacement for omitted internal editing note and unresolved delivery-guarantee bullet | 0.25–0.5 day after approval |
| P0-05 Reviews/process | Four exact source testimonials with verification notice; original process text/videos restored | CMS14 questions review authenticity: notice/noindex remains; captions/transcripts and video playback QA missing | 1–3 days |
| P0-06 Contact | Recovered phone/email/hours/copy complete; disabled form retained | FastAPI validation/anti-spam/persistence/delivery; no writes authorized in this pass | 2–5 days |
| P0-07 Legal/SEO/routes | Original legal paths/banners, aliases, metadata, static SEO shells, canonical handling and sitemap implemented | CMS20/21 are Lorem Ipsum: policies unavailable and noindex; Reviews also noindex. Client legal copy, origin confirmation, body prerender/hosting status decision | 1–3 days plus legal approval |
| P0-08 Asset isolation | Complete: 32 approved media files served/built; 5,023 originals excluded; originals/backups untouched | Deploy dist only; review any future additions | 0.25–0.5 day deployment verification |
| P0-09 Security | Public asset boundary and safe text rendering completed | Existing-secret rotation and future backend/auth security still belong to authorized owners | Original 2–5 day range |
| P0-10 QA | Build/TypeScript plus 12-route server-rendered semantics/link/media/SEO checks and localhost asset-isolation/range checks passed | Browser viewport, keyboard/screen-reader, full playback, hosting and backend QA not performed | 1–3 days plus backend QA |

### Content deliberately withheld

- Lorem-Ipsum Terms and Privacy bodies; never presented as usable legal policies.
- CMS14 internal request for real reviews; replaced with visitor-facing attribution verification notice, preserving the requested four active review records.
- Custom Packaging medical-equipment editing instruction and dangling examples prompt.
- Domestic Shipping delivery-guarantee bullet containing an unfinished asterisk instruction.
- Unrelated Central Cargo/Dubai location, lorem-ipsum address, and unconfirmed map/social destinations.

Client confirmation is still needed for recovered percentage savings, dispatch timing, insurance/tracking, geographic coverage, carrier relationships, experience/volume and guarantee claims. Publication-enabled status alone does not verify these claims.

P1/P2 functional estimates above remain pending. Newsletter/account/quote/payment/tracking are not functional or linked to guessed Admin destinations. Implementation details and exact verification limits are in `frontend/IMPLEMENTATION.md`.

## Website FastAPI submission pass — 2026-11-06

This supersedes static-pass statements that contact/newsletter endpoints are absent. Scope is website-only; Admin repositories and production resources were not accessed or modified.

| Priority / task | Completed | Remaining dependency | Estimated remaining effort |
| --- | --- | --- | --- |
| P0 contact delivery | FastAPI schemas, SMTP interface, safe disabled local provider, contact UI, errors/loading, privacy-safe logging | Production SMTP credentials/verified sender/inbox; approved privacy and retention policy; staging delivery/bounce checks | 1–2 days plus approvals |
| P0 abuse/deployment | Origin policy, JSON/body limits, honeypot, SQLite rate/idempotency metadata, uncertain-delivery handling | Same-origin HTTPS proxy, pre-validation rate/time/concurrency limits, service-only ledger permissions, stable secret, monitoring | 1–2 days |
| P0 QA | Automated API tests, frontend build/content/route/asset checks; app-source lint | Real browser mobile/keyboard/screen-reader submission QA; actual provider and proxy staging tests | 0.5–1.5 days |
| P1 newsletter | Consent-required subscription-request form and notification endpoint | Approved mailing-list provider; double opt-in, unsubscribe, consent persistence, callback validation and deduplication; no completed enrollment claimed | 2–4 days |
| P1 resilient intake | Metadata-only replay/concurrency ledger; no false queued-success | Optional durable encrypted inquiry/outbox storage and bounded retry worker if required; policy/operations approval | 2–4 days |
| P2 multi-host scaling | Explicit single-host assumptions documented | Shared atomic rate/idempotency store before multiple replicas; capacity/load verification | 1–3 days |

Quote/account/payment/tracking work is unchanged and remains pending. No RDS mutations, AWS changes, deployment, commits or pushes were performed. Backend setup/API contract/security deployment checklist: `../../backend/README.md`.

## Static release preparation — 2026-11-06

P0 asset/Git boundary and deployment tooling prepared: 32 approved public media retained, 5,023 original extras archived locally under ignored `local-private-assets/legacy-public`; root ignore rules, SHA-256 media lock, source-candidate scan, local build/release packaging, and verification/staging helper added. Both required MP4s exceed ordinary GitHub Git file limits, so they are preserved locally and recovered through approved media release assets. Nothing was committed, pushed, published or deployed.

Build/lint/12-route/four-alias/media validation passed; seven archive/staging helper tests passed. Verified local nonpublishable bundle: 52 files/~561.1 MiB. Owner approval remains required for repository/media publication, content/legal policies, EC2 capacity, dedicated directory and domain/TLS/Nginx routing. The host Admin application is untouched. Estimated remaining operator deployment/staging/QA work: 0.5–1.5 days after approvals; video optimization is a separate 0.5–2 day option if disk is insufficient. See `../deployment/EC2_STATIC_WEBSITE.md` for exact commands and constraints.


## Website backend completion — 2026-11-07

On `feature/website-backend-production`, production-baseline contact/newsletter integration now includes bounded TLS SMTP, safe retries, dependency readiness and encrypted double opt-in/unsubscribe. Newsletter intake success means confirmation email accepted; membership requires explicit confirmation. Forms handle validation/unavailability/uncertain delivery without false success. No premium UI or production deployment changes.

Validated: 41 backend tests, 8 browser integration tests, 7 deployment-helper tests, frontend build/lint and 12-route/32-asset validation. Remaining P0: approved SMTP configuration and controlled delivery verification, privacy/retention approval, host resource/port checks, dependency advisory review, isolated service/proxy approval. P1: approved campaign delivery that honors active state/unsubscribe; no campaign sender or subscriber admin UI exists. See `docs/integration/WEBSITE_BACKEND_PRODUCTION.md` and `docs/deployment/WEBSITE_BACKEND_EC2.md` from repository root. This entry supersedes earlier descriptions of newsletter as inbox-only or health as configuration-only.

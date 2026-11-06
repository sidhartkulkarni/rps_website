# Website backend completion

## Audit and implementation plan

Branch `feature/website-backend-production` starts at `37cfffddad1807289b3c314535ba8a824fddf0d6`, verified through read-only GitHub metadata for `website-v20261106-1`. Premium UI branch remains at `92a9dc3` and is not merged or modified.

Existing routes validate contact/newsletter JSON and send synchronous SMTP with a metadata-only SQLite replay ledger. Gaps: health only reports configuration; limits apply after validation; socket timeout is not a total delivery deadline; newsletter only notifies an inbox; no subscription lifecycle; frontend cannot distinguish safely retryable versus uncertain delivery. Existing tests cover basic validation/replay/CORS but not subscriber transitions or actual browser submission outcomes.

Plan:
1. Preserve existing POST payloads and successful `status:delivered` response while adding stable safe error codes/retry flags.
2. Add request-wide size/read deadlines and pre-validation quotas; bounded concurrent delivery; asynchronous SMTP with total deadline, verified TLS and no background sends after timeout.
3. Implement explicitly requested double opt-in/unsubscribe using encrypted addresses in website-only SQLite. Signed opaque links and explicit POST actions; no GET mutations or plaintext email/token logging/storage.
4. Add cached readiness checks for writable storage and authenticated SMTP. Keep health responses private-data-free.
5. Verify production-baseline React forms using mocked browser API outcomes; retain current appearance/routes. No premium UI changes.
6. Add isolated localhost/systemd/Nginx handoff and exact rollback to the 503 fallback. No host operations or deployment performed.

SMTP credentials, approved sender/domain, deliverability, host port availability and approved privacy/retention copy remain external prerequisites. No new AWS resources or Admin database access are needed.

## Completed implementation and validation

Contact SMTP delivery, bounded request handling, dependency readiness, encrypted newsletter double opt-in and unsubscribe are implemented. The existing contact/newsletter request contracts are preserved. Confirmation email acceptance is explicitly distinct from enrollment. Frontend changes are restricted to the existing submission component and tests; premium styles and production static files are untouched.

Validation on 2026-11-07: 41 backend tests passed; 8 Chromium browser integration tests passed with mocked API outcomes; 7 release-helper tests passed; frontend build, ESLint, public-site validator (12 routes, 32 approved assets), pip dependency consistency and repository security heuristic passed. One upstream Starlette/httpx deprecation warning remains. Browser tests required permission to bind a dedicated local port. No live SMTP, real EC2 service, Nginx configuration or external deliverability was tested. Existing npm tooling reports moderate advisories; do not force-upgrade unrelated toolchain dependencies without compatibility testing. Repository scanning is heuristic, not a guarantee of absence of secrets.

## File-by-file changes

| File | Change |
| --- | --- |
| `backend/app/main.py` | Lifecycle, dependency health, safe error handling and structured logger. |
| `backend/app/core/config.py` | Validated environment, origins, TLS, secrets, storage and bounded limits. |
| `backend/app/core/security.py` | Private ledger permissions, pre-validation quotas and storage probe. |
| `backend/app/core/errors.py` | Safe error codes and explicit retryability. |
| `backend/app/core/requests.py` | Size/read limits, origin/content-type checks and safe headers/errors. |
| `backend/app/schemas/submissions.py` | Email/header/control-character validation and token payload schema. |
| `backend/app/services/delivery.py` | Authenticated TLS SMTP, total deadline, stable Message-ID and acceptance uncertainty. |
| `backend/app/services/submissions.py` | Concurrency gate, replay and safe retry handling, confirmation delivery. |
| `backend/app/services/newsletter.py` | Encrypted subscriber state, signed links, consent, quotas and retention. |
| `backend/app/services/newsletter_pages.py` | Explicit accessible confirmation/unsubscribe pages with CSP and fragment tokens. |
| `backend/app/services/health.py` | Cached writable-store/encryption/SMTP readiness. |
| `backend/app/routers/newsletter.py` | Confirmation and unsubscribe GET/POST routes. |
| `backend/app/maintenance.py` | Website-only retention command. |
| `backend/requirements.txt`, `backend/requirements.lock.txt` | SMTP/encryption dependencies and pinned runtime closure. |
| `backend/.env.example` | Nonsecret environment reference. |
| `backend/tests/test_api.py` | Existing contract tests adapted for readiness and SMTP. |
| `backend/tests/test_newsletter.py` | Lifecycle, retention, key integrity and failure tests. |
| `backend/tests/test_hardening.py` | Request/SMTP deadlines, limits, privacy and failure coverage. |
| `backend/deploy/rps-website-api.service` | Dedicated loopback service with resource and filesystem restrictions. |
| `backend/deploy/rps-website-retention.service`, `backend/deploy/rps-website-retention.timer` | Daily isolated cleanup. |
| `backend/deploy/website-api-proxy.conf.example`, `backend/deploy/website-api-fallback.conf.example` | Reviewed handoff templates; not installed. |
| `.gitignore` | Preserve the reviewed environment template after case-insensitive environment exclusions. |
| `backend/README.md` | API contract, operational assumptions and subscriber data lifecycle. |
| `frontend/src/components/SubmissionForm.tsx` | Accessible states, safe retry keys and uncertain-delivery lockout. |
| `frontend/package.json`, `frontend/package-lock.json` | Browser test command/dependency. |
| `frontend/playwright.config.ts`, `frontend/tests/submissions.spec.ts` | Dedicated local browser tests for eight submission scenarios. |
| `frontend/IMPLEMENTATION.md` | Current backend integration status. |
| `docs/legacy-audit/IMPLEMENTATION_BACKLOG.md` | Completed work and remaining launch requirements. |
| `docs/deployment/WEBSITE_BACKEND_EC2.md` | Exact isolated install/validation/503 rollback procedure. |
| `docs/integration/WEBSITE_BACKEND_PRODUCTION.md` | Audit, plan, validation and this change inventory. |

## Remaining launch gates

Approve working SMTP credentials, sender/inbox and outbound connectivity; validate controlled mail and bounce behavior. Approve privacy/retention policy and secure backup handling. Verify EC2 resource/port/Python compatibility and Nginx slow-client/concurrency protections. Review runtime and npm dependency advisories before release. Publish only reviewed commits, deploy backend behind existing 503 fallback, validate locally, then enable only website proxy. Release frontend retry improvements separately. No campaign dispatch/export or admin subscription management is implemented. See the deployment runbook for rollback; retain subscriber state and keys across all code rollbacks.

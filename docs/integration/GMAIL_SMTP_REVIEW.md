# Gmail SMTP readiness review — 2026-11-07

Scope: `feature/website-backend-production`, website repository only. Admin configuration is accepted as user-confirmed context; no Admin credential file or customer record was read. No SMTP connection, real email, deployment, service restart, commit or push was performed. The premium UI branch was not changed.

## Findings and corrections

| Area | Finding |
| --- | --- |
| Transport | Existing adapter supports `smtp.gmail.com:587`, explicit STARTTLS, certificate validation and authenticated login. It does not implement OAuth token acquisition/refresh. |
| Envelope sender | Fixed `WEBSITE_MAIL_FROM=noreply@rapidpacknship.com`; authentication account must be authorized to send as this mailbox/alias. Google may reject or rewrite unauthorized identities. Actual received headers require verification. |
| Display name | Added validated `WEBSITE_MAIL_FROM_NAME=RapidPacknShip`, encoded using Python's structured Address header; control characters rejected. |
| Contact routing | One envelope recipient: `WEBSITE_MAIL_TO=mark@rapidpacknship.com`. Reply-To remains validated submitting customer email so the business can answer the inquiry. No customer auto-reply is sent. |
| Newsletter routing | One envelope recipient: validated subscribing customer email. Added fixed business Reply-To `WEBSITE_MAIL_REPLY_TO=mark@rapidpacknship.com`, defaulting to `MAIL_TO` if omitted. Customer replies therefore reach Mark, not the noreply mailbox. |
| Header safety | Fixed subjects and envelope sender; no customer-selected CC/BCC or business recipient. Names/messages are body content, not header syntax. Pydantic validates customer email/control characters. Sender display name is bounded to 100 characters. |
| Public links | `WEBSITE_PUBLIC_ORIGIN=https://rapidpacknship.com` produces confirmation and unsubscribe links under `/api/website/newsletter/`. Host/Origin headers cannot select link destination. Production requires HTTPS and an explicit allowed origin. Signed tokens use fragments, never email addresses or query parameters. GET only shows a page; explicit POST changes membership. |
| Acceptance | Contact success requires SMTP acceptance and recorded replay status. Newsletter success means confirmation email accepted, not membership active. SMTP acceptance does not prove inbox delivery. |
| Failures/retries | Definitive refusal permits retry with the same UUID/payload. Ambiguous DATA acceptance or a crash remains uncertain; no automatic resend. Same-key successes replay for seven days. Reload/new keys can duplicate submissions; SMTP is not exactly-once. |
| Timeouts | Operation 8s; total delivery 20s; health SMTP 8s; request body 10s. Transport closes on cancellation. An OS DNS resolver thread can finish later without sending mail. Two in-flight sends; one production worker. |
| Abuse | 16 KB streaming cap, JSON/field/honeypot checks, pre-validation client/global quotas, recipient cooldown and three confirmation requests/address/day. CORS/Origin restrictions supplement, not replace, throttling. All POSTs including token actions consume quota. No CAPTCHA or account-wide email budget coordinator. |
| Logging/storage | Fixed event metadata and random request IDs only; no form text, email, SMTP password or provider traceback. Contact bodies are not persisted. Subscriber addresses are encrypted in website-only SQLite; stable keys and consent/retention approval required. Proxy/body/APM logging must remain disabled for this API. |
| Health | Cached writable storage, encryption probe and authenticated SMTP NOOP. It does not send email or prove sender permissions, remaining sending quota, SPF/DKIM/DMARC or inbox placement. |

## Exact production environment

Use [`backend/deploy/production.env.example`](../../backend/deploy/production.env.example), which contains public configuration and placeholders only. Required deployment inputs:

- `WEBSITE_ENVIRONMENT=production`, `WEBSITE_PROVIDER=smtp`
- `WEBSITE_ALLOWED_ORIGINS=["https://rapidpacknship.com"]`, `WEBSITE_PUBLIC_ORIGIN=https://rapidpacknship.com`
- `WEBSITE_LEDGER_PATH=/var/lib/rps-website-api/delivery.sqlite3`
- `WEBSITE_FINGERPRINT_SECRET`: stable random secret, at least 32 characters
- `WEBSITE_SUBSCRIBER_ENCRYPTION_KEY`: stable Fernet key
- `WEBSITE_SMTP_HOST=smtp.gmail.com`, `WEBSITE_SMTP_PORT=587`, `WEBSITE_SMTP_TLS=starttls`
- `WEBSITE_SMTP_USERNAME`: authorized full Google account email; do not assume sender alias equals login
- `WEBSITE_SMTP_PASSWORD`: operator-provisioned app password; never extract into source or print
- `WEBSITE_MAIL_FROM=noreply@rapidpacknship.com`, `WEBSITE_MAIL_FROM_NAME=RapidPacknShip`
- `WEBSITE_MAIL_TO=mark@rapidpacknship.com`, `WEBSITE_MAIL_REPLY_TO=mark@rapidpacknship.com`

The example also enumerates every operational timeout/quota/retention variable. Settings do not automatically read `.env` files; systemd loads the root-only EnvironmentFile. Placeholder keys intentionally do not constitute a working configuration.

Google documents port 587/TLS and full account email plus app password for this SMTP option. Account policy must permit that authentication method. App passwords require 2-Step Verification and can be unavailable under some policies; a normal Google password is not an assumed substitute. If OAuth is mandatory, this adapter needs an approved OAuth implementation before launch. Do not reset account credentials or revoke any existing Admin app password. An independently issued website app password offers separate revocation, but **does not provide a separate sending quota**. [Google SMTP setup](https://knowledge.workspace.google.com/admin/gmail/send-email-from-a-printer-scanner-or-app), [app passwords](https://support.google.com/accounts/answer/185833).

## Shared-account risk: launch gate

Google lists 2,000 messages per user for paid Workspace accounts and 500 for trial accounts, over a rolling 24-hour window. Alias mail counts toward the user's limit. Exceeding limits can prevent sending for up to 24 hours; limits can change. Confirm actual account edition/status with its owner. [Google sending limits](https://knowledge.workspace.google.com/admin/gmail/gmail-sending-limits-in-google-workspace).

Inference for this deployment: if website and Admin authenticate as the same Google user, contact/confirmation traffic competes with OTP and shipping-label mail, regardless of process isolation or app password separation. Existing default 100 requests/600 seconds permits roughly 14,400 requests/day across distributed clients, well above the cited mail allowance. Not every request sends mail, but this is not safe quota reservation. The production example lowers the global window quota to 5 (roughly 720 requests/day under sustained use); even that cannot guarantee Admin headroom, and can throttle confirmation/unsubscribe requests. This is an illustrative starting point, not an approved budget.

Before enabling: obtain aggregate peak/rolling daily Admin mail volume and account limits without exporting customer records; reserve transactional headroom and an operational safety margin. Choose an approved website budget or use a separately authorized sending account/provider with verified sender rights. A different alias or password on the same account is insufficient. Do not claim isolation until this is resolved. Stop website mail via the existing 503 fallback if shared-account delivery errors rise; do not retry in a loop. No marketing campaign sending should use this rollout.

## Deployment and verification

Follow [EC2 runbook](../deployment/WEBSITE_BACKEND_EC2.md): isolated loopback service, root-only credentials, dedicated state, local readiness, explicit website-only proxy switch and 503 rollback. SMTP credentials, outbound 587, sender authorization, shared quota budget and policy approval remain prerequisites. Readiness can pass even when DATA later fails due to quota.

## Validation and exact files changed in this review

47 backend tests passed, including six new parameterized cases covering Gmail TLS options, envelope/header routing, sender injection rejection and public HTTPS links. Tests use fake SMTP only. One upstream Starlette/httpx deprecation warning remains. No frontend changes in this review; prior frontend build/browser results are not claimed as a fresh run.

- `backend/app/core/config.py`: sender-name and business Reply-To settings/validation.
- `backend/app/services/delivery.py`: structured From display name and newsletter Reply-To.
- `backend/.env.example`: new nonsecret variable names.
- `backend/deploy/production.env.example`: complete Gmail production template with placeholders.
- `backend/tests/test_smtp_configuration.py`: six transport/header/link tests.
- `backend/README.md`: header behavior and production-template reference.
- `docs/deployment/WEBSITE_BACKEND_EC2.md`: Gmail configuration, safe secret permissions and email verification.
- `docs/integration/GMAIL_SMTP_REVIEW.md`: this review, sources, risks and change inventory.

Earlier uncommitted backend/frontend work on this branch is retained. Live Gmail delivery, quota capacity, EC2 resource availability and Nginx installation remain unverified.

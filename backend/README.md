# Public website backend

This service belongs only to `rps_website`. It does not import Admin code, connect to RDS, provide customer authentication, or implement quotes/payments/tracking. Python 3.11+ is required. No legacy PHP is executed.

## Development

From `backend`:

```sh
python3.11 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/python -m pytest -q
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001 --no-access-log --no-proxy-headers
```

Run `npm run dev` in `frontend`; Vite proxies only `/api/website` to port 8001. This is distinct from the separate Admin backend. Settings are environment variables prefixed `WEBSITE_`; `.env.example` documents names, not credentials, and is not auto-loaded.

Default provider `disabled` returns HTTP 503. It never writes messages to disk or logs, sends mail, or pretends success. Tests inject an in-memory fake provider; no debug-success provider is exposed through configuration. Default SQLite metadata is in `/tmp`, outside source. Development mode is not a production configuration.

## API contract

All POSTs require `Content-Type: application/json` and `Idempotency-Key: <UUID>`. Maximum body: 16,384 bytes. No cookies or customer/organization identifiers are accepted. Unknown fields are rejected. Strings are trimmed.

| Endpoint | Request | Successful response |
| --- | --- | --- |
| `GET /api/website/health` | None | 200 `{"status":"ok","delivery_configured":false}`; liveness/config selection only, not SMTP connectivity proof |
| `POST /api/website/contact` | `name` 1–100 chars, valid `email` <=254 chars, `subject` 1–200, `message` 1–5000; optional empty `website` honeypot | 200 `{status:"delivered", request_id:<UUID>, message:...}` only after SMTP acceptance |
| `POST /api/website/newsletter` | valid `email` <=254 chars, `consent:true`; optional empty `website` | Same shape; explicitly a subscription **request**, not completed enrollment |

400 missing/invalid key; 403 disallowed Origin; 409 key/content conflict; 413 oversized body; 415 non-JSON; 422 invalid fields; 429 throttle (Retry-After); 503 unavailable or uncertain delivery. Error bodies use safe `detail` text and never echo submitted data. Frontend shows generic safe errors, retains fields on failure, disables submissions in flight, and keeps retry keys in memory only. A page reload loses the retry key; users are advised to contact the business if delivery cannot be confirmed.

## Delivery and idempotency

`services/delivery.py` defines the delivery protocol and SMTP adapter. `WEBSITE_PROVIDER=smtp` requires host, username, password, fixed sender and **one** internal recipient. SMTP uses certificate-verified STARTTLS (port 587 by default), authentication, a 15-second socket timeout, and no debug output. Submitted email is in the plain-text body, never used as an arbitrary recipient; subject headers are fixed. No autoreply is sent, avoiding an anonymous mail relay. Provider acceptance is not proof of inbox delivery; operators must monitor bounces/spam/delivery separately.

Metadata ledger contains HMAC(key), HMAC(canonical payload), random request ID, status/time, and HMAC(client IP) rate counters. It contains no raw email/name/message/IP. SQLite transactions prevent simultaneous sends for the same key across workers sharing the same local disk. Only an explicitly pre-send failure is retryable with the same key. Success replays return the original ID without sending. Timeout/error during SMTP submission, unexpected provider failure, process crash, or ledger failure after SMTP send remains uncertain/processing and must not automatically resend. SMTP Message-ID is stable, but SMTP provides no exactly-once guarantee. A disconnect during QUIT after confirmed acceptance does not turn success into failure.

Replay retention is seven days; do not retry old keys after that window. Rate counters expire after the configured window and are pruned on submissions; delivery metadata is similarly pruned on submissions. No periodic task runs. Stable HMAC secret and ledger must survive restarts; secret rotation or ledger loss invalidates replay protection. Client-supplied different keys can represent duplicate messages: key-based deduplication is not identity verification.

## Production prerequisites (not performed)

1. Approve privacy/contact retention disclosures and actual legal policies before enabling collection. Existing legal pages lack approved source copy.
2. Supply working SMTP credentials, verified sender, fixed internal inbox, SPF/DKIM/DMARC and provider/bounce handling. Legacy audit documents PHPMailer/SMTP (`docs/legacy-audit/API_AND_INTEGRATIONS.md`), not a verified working account. No credentials or production access were assumed.
3. Set `WEBSITE_ENVIRONMENT=production`, `WEBSITE_ALLOWED_ORIGINS=["https://rapidpacknship.com"]` (include only actual canonical/alternate hosts used), stable high-entropy `WEBSITE_FINGERPRINT_SECRET`, and absolute external durable `WEBSITE_LEDGER_PATH`, e.g. `/var/lib/rps-website/delivery.sqlite3`. Provision directory and file with service-only permissions (`umask 077`), encryption/backups/retention appropriate for pseudonymous metadata. Do not put this ledger in the repository or frontend build. Startup fails for missing/insecure production secret/temp path. Do not log the environment.
4. Serve frontend and `/api/website` through the **same HTTPS origin** on existing EC2. Production CORS emits no allow-origin headers. Development permits only explicit configured origins. Origin checking is defense-in-depth, not authentication: non-browser clients can omit/spoof Origin.
5. Bind Uvicorn to loopback, disable access logs (including proxy body/query logging), configure trusted proxy IPs explicitly if forwarded client addresses are needed. The app never parses X-Forwarded-For itself. Without trusted forwarding all callers share the proxy IP quota; with broad trust callers could evade it. Do not use `--forwarded-allow-ips '*'` on an exposed listener.
6. Reverse proxy must enforce a 16 KB body limit, body/header read timeouts, connection/concurrency limits, and per-IP/global request rates **before validation**, including malformed requests. App quotas default to five validated submissions per client per 600 seconds, 100 globally per 600 seconds, shared across endpoints. App honeypot/global quota are basic controls, not bot-proof protection; add monitored challenge/WAF if abuse warrants it. Socket timeout is not a total request deadline. Set proxy response timeout to accommodate SMTP operations; reconcile uncertain requests rather than blind retries.
7. Current ledger is for one EC2 host/local filesystem, including multiple workers; not multiple hosts, NFS, or horizontal replicas. Introduce a shared atomic limiter/idempotency store before scaling. Monitor ledger growth and disk availability. Do not point it at Admin RDS.
8. Delivery is synchronous with **no stored inquiry body, durable outbox, or retry worker**. The business inbox is the only content destination after SMTP acceptance. If durable intake independent of SMTP is required, add a separately authorized encrypted website store/outbox, retention/deletion policy, bounded retry worker and delivery receipts. Never return queued-success before committing durable content.
9. Newsletter currently routes a consented request to the business inbox. It does not create a marketing-list membership, send confirmation tokens, or unsubscribe users. Implement an approved mailing-list provider with double opt-in, unsubscribe, verified callback handling, consent record/retention and address deduplication before calling it completed enrollment. Do not manually subscribe unverified addresses automatically.
10. Run staging SMTP acceptance/bounce checks and actual browser keyboard/mobile/screen-reader submission QA. Dependency pins are recorded for reproducibility, not a vulnerability certification; scan dependencies before deployment.

Structured application logs contain only fixed event names, endpoint kind and random request IDs. Validation errors omit Pydantic input/context. Infrastructure/APM must not capture request bodies, headers, or provider exceptions. Health is liveness, not readiness. No production DB/infrastructure changes or deployment occurred.

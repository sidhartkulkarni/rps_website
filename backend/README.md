# Public website API

Python 3.11+, isolated from Admin, mobile and RDS. No production deployment has been performed. See [deployment runbook](../docs/deployment/WEBSITE_BACKEND_EC2.md).

## Local development

From `backend`, create `.venv`, install `requirements-dev.txt`, then run `.venv/bin/python -m pytest -q`. Start with `.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001 --no-access-log --no-proxy-headers`. Vite proxies `/api/website` to 8001. Environment variables are documented in `.env.example`; files are not automatically loaded. Default disabled delivery fails closed with 503 and sends/stores no inquiry. Tests use synthetic records and fake SMTP.

## Contract

All POST requests require JSON, maximum 16,384 bytes. Unknown fields are rejected. Contact and newsletter intake also require `Idempotency-Key: <UUID>`.

| Route | Input / behavior |
| --- | --- |
| GET `/api/website/health` | 200 only when writable ledger, subscriber encryption and authenticated SMTP NOOP pass; otherwise 503. Results cached 30 seconds. |
| POST `/api/website/contact` | `name` 1–100, `email` valid <=254, `subject` 1–200, `message` 1–5000; optional empty `website` honeypot. |
| POST `/api/website/newsletter` | Valid `email`, `consent:true`, optional empty `website`. Sends confirmation, does not immediately enroll. |
| GET `/api/website/newsletter/confirm` | Confirmation page; token in fragment, explicit button required. |
| POST `/api/website/newsletter/confirm` | `{ "token": "..." }`; activates an unexpired pending subscription. |
| GET `/api/website/newsletter/unsubscribe` | Cancellation/unsubscribe page; explicit button required. |
| POST `/api/website/newsletter/unsubscribe` | `{ "token": "..." }`; cancels pending or active membership and clears encrypted email. |

Intake success is `{status:"delivered",request_id,message}` only after SMTP acceptance and successful ledger update. Newsletter acceptance means confirmation mail accepted, not confirmed membership. SMTP acceptance is not inbox delivery. Errors contain safe `detail`, `code`, `retryable` fields: 400 key errors, 403 origin, 409 conflicts, 413 size, 415 content type, 422 validation, 429 quotas, 503 unavailable/uncertain. Validation responses never echo form values.

## Reliability and privacy

SMTP requires authenticated certificate-verified STARTTLS or implicit TLS. Defaults: 8-second operation timeout, 20-second total delivery deadline, two simultaneous submissions, one production worker. A cancelled OS DNS lookup may finish in an executor thread, but cannot subsequently send mail. Health uses an 8-second SMTP deadline. No background queue or automatic retry exists. Contact bodies go only to the configured business inbox, not disk or logs.

Replay metadata uses HMACs, random IDs and status. Same UUID and identical payload replays success without resending for seven days. Definitive SMTP rejection allows same-key retry; ambiguous DATA acceptance, crashes and post-send ledger errors block automatic retry. SMTP cannot guarantee exactly-once delivery. Changing keys or losing ledger history defeats deduplication. Frontend blocks uncertain retries and preserves the same key for explicitly safe failures; reload loses its in-memory key.

Subscriber addresses are Fernet-encrypted in website-only SQLite; lookup keys are HMACs. SMTP local-part case is preserved. Consent version and confirmation timestamps are retained. Pending links expire after 48 hours. Repeated confirmation/unsubscribe is safe; cancelled tokens cannot reactivate membership. Resubscription uses a new generation. Per-address cooldown is 15 minutes, maximum three confirmation requests/day. Intake quotas default to five POSTs/client/10 minutes and 100 globally, including malformed requests and token actions. Origin checks are defense-in-depth, not authentication.

Daily maintenance removes old pending/unsubscribed records after 30 days, expired rate counters and seven-day replay records; active subscribers remain until unsubscribe. Deleted ciphertext may remain in filesystem/database backups: approve backup retention and encryption. Never rotate either persistent key without an explicit migration. Key mismatch fails startup. Store and keys must survive releases and rollback. This is one-host local SQLite, not NFS or a multi-host service.

No campaign sender, subscriber export, admin subscription UI or RDS integration is included. Future campaigns must honor active membership and provide unsubscribe links. Approve privacy/retention copy before collection. Application logs contain fixed events and random request IDs only; infrastructure/APM must also avoid body, query, header and exception capture. Production CORS is same-origin; development origins are explicitly allowlisted.


## Confirmed Gmail deployment configuration

See `deploy/production.env.example` and [SMTP review](../docs/integration/GMAIL_SMTP_REVIEW.md). Gmail uses port 587 with STARTTLS. `WEBSITE_MAIL_FROM_NAME` defaults to `RapidPacknShip`; From and SMTP envelope sender use the configured noreply mailbox. Contact mail goes to Mark with validated customer Reply-To. Newsletter confirmation goes to the subscriber with `WEBSITE_MAIL_REPLY_TO` (or `MAIL_TO`) as business Reply-To. No customer inquiry auto-reply exists. Shared Google account sending quotas can affect Admin notifications; approve the budget before enabling even if health passes.

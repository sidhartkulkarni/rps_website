# API and integrations

Audit date: 2026-11-06. Offline/read-only source inspection; no application/PHP/SQL execution, database connection, deployment, archive extraction, or changes to React. Source root: `/Users/siddharthkulkarni/Downloads/RPS FE WS`. Paths below are relative to `TransferNow-20261030We5tBjjq/api (1)` unless stated otherwise. Snapshot status is not proof of current production deployment.

## Evidence levels

**Public-linked** means a current candidate view links a route/form; **implemented** means controller/API code exists; neither proves deployment or successful execution. **Inherited/unverified** means code or configuration exists without enough public-use evidence. No endpoint was called. Regex method inventories can include unreachable branches; the recommendations below deliberately avoid treating every historical integration as active.

## Website functionality to replace

| Feature | Source and current behavior | Evidence / data | Suggested FastAPI boundary |
| --- | --- | --- | --- |
| Public CMS | Home/About_us/Services/Reviews controllers and model_cms_page.get_page | Public-linked; rp_cms_page active IDs, banners, logo | GET /api/public/pages/{slug}, /site-settings; static content at build time is also valid |
| Services | Services.index/detail, model_services | Public-linked; active catalog, slug lookup, long HTML description | GET /api/public/services and /services/{slug}; reject inactive records |
| Packaging | Services.index, model_shipping_packaging | Public-linked; six active expandable cards | GET /api/public/shipping-packaging |
| Reviews | Reviews.index; find_all_active ordered descending | Public-linked read-only display; four active reviews | GET /api/public/reviews; no POST required for parity |
| Contact inquiry | Contact_us.store; reCAPTCHA verification, model validation and inquiry insert | Public form; rp_inquiry private records | POST /api/public/inquiries; validation, anti-spam, persistence, delivery and errors |
| Newsletter | Contact_us.newsletter; model validation/insert, session subscriber state, email-template generation | Footer form; rp_newsletter private subscriber list | POST /api/public/newsletter; consent, deduplication, provider delivery and unsubscribe design |
| Registration | Account.register/save_signup, model_signup; phone/email verification helpers | Header Sign In links account; registration implemented | POST /api/auth/register, /verification/request, /verification/confirm |
| Login / OTP | Account.do_login, resend_login_otp, verify_login_otp, trusted-device records | Implemented; session and identity model dependencies | POST /api/auth/login, /otp/request, /otp/verify, /logout; GET /api/me |
| Password/account updates | Account.forgotpasswordemail/resetpassword/update_password/verify_change_password_otp | Implemented; private identity data | POST /api/auth/password-reset/request and /confirm; PATCH /api/me; reauthentication |
| Quotes | Account.quotes/quotelistings/submitQuote/saveQuoteDetails/quote_invoice | Implemented authenticated workflow; rp_quote and invoice items | POST /api/quotes; GET /api/quotes and /quotes/{id}; ownership and state validation |
| Invoice attachment | Account.uploadInvoice/sign/viewInvoice/getInvoiceItems; S3/cURL helpers | Implemented; operational invoice API dependency | POST /api/uploads/presign, POST /api/quotes/{id}/attachments; scoped signed URLs |
| Checkout/payments | Checkout, Customizer, Account.paywith_stripe; cart/session state | Implemented but gateway usage/production authority unverified | POST /api/checkout/session; gateway webhook endpoint with verified signatures/idempotency |
| Account history/chat | Account.inbox/start_chat/chat_send_admin/chat_data/markMessagesAsRead and invoice/history methods | Implemented; depends on admin ownership/data not fully covered by supplied dumps | GET /api/me/invoices; /messages with ownership checks; reuse existing admin contracts where possible |
| Geography helpers | Account.zip_lookup/select_cities | Implemented; external postcode/geocode services | GET /api/locations/postcode/{code}, /states/{id}/cities with rate limits/caching |

Paths in the final column are proposals, not recovered endpoints. Do not expose source controller names or migrate every legacy handler one-for-one. Contact/quote/newsletter must remain unavailable in React until their real endpoint is validated.

## Operational API / RPS Admin boundary

Standalone `api/*.php` includes:

- `api/list-invoice-items-packing.php`
- `api/login.php`
- `api/upload-fallback.php`
- `api/complete-item-stage.php`
- `api/find-product.php`
- `api/auction-houses.php`
- `api/generate-upload-url.php`
- `api/barcode_pdf_email.php`
- `api/get-invoice-stage-counter.php`
- `api/list-invoice-items.php`
- `api/generate_labels.php`
- `api/update-missing-flag.php`
- `api/get-invoice-items.php`
- `api/barcode_pdf.php`
- `api/insert_invoice.php`
- `api/invoice.php`
- `api/buyer-checkout.php`
- `api/send-labels.php`
- `api/get-invoice-status.php`

These cover invoice ingestion/listing, auction-house selection, product lookup, barcode/PDF labels, missing-item flags, upload URLs, item-stage completion and stage counters. `complete-item-stage.php` updates item state and aggregates invoice state; `buyer-checkout.php` lists invoice/bidder summaries by auction house. They belong to the operational system, not anonymous public content. `rpns.sql` supplies invoice_details/item_details/auction_houses/users plus historical backups.

The current Admin backend repository was deliberately not inspected under this audit's source scope. Existing RPS Admin endpoint compatibility and system-of-record ownership therefore remain unverified. Before replacement, agree identifiers, invoice/quote relationships, stage state machines, authorization roles and event delivery with that service owner. Prefer a controlled adapter/API over dual-writing two databases. The PHP website's operational API calls establish a dependency, not proof that the modern Admin already implements it.

## External integrations and dependencies

- **AWS S3**: `api/generate-upload-url.php` creates presigned upload requests; Account contains invoice upload/view signing helpers. Replace hardcoded credentials with a server-side IAM role, scope keys to an authenticated owner and enforce file type/size/expiry. Do not expose bucket administration to the browser.
- **Email**: core MY_Controller and model/email helpers use SMTP/sendMail-style paths; PHPMailer source and templates exist. Contact/newsletter/account flows need independently verified delivery behavior, configured sender, retries and monitoring. Presence of a template alone does not prove a send succeeds.
- **Twilio**: Account and Home contain SMS/WhatsApp/OTP code and test handlers. Verify the intended channel, rate/attempt limits, expiration and provider account before migration; do not port publicly reachable test-send actions.
- **Payments**: Stripe calls occur in Checkout, Customizer and Account. PayPal/Braintree/Authorize.Net/Square/Worldpay/payline-related handlers or libraries also exist. Some references include demo/test endpoints and inherited code. Confirm the one intended production provider before implementation; do not assume all need parity. Reconcile payment state through signed webhooks and idempotent events, never client redirects alone.
- **Shipping**: UPS and USPS URLs/rate helpers appear in Checkout. Provider availability, credentials, pricing authority and current API compatibility are unverified; create adapters only after product confirmation.
- **Geography/maps**: Zippopotam.us, Google Maps/geocoding and public map configuration occur in Account/Contact. Public map URL and key restrictions need owner approval.
- **PDF/barcodes**: TCPDF-related assets/scripts and barcode/email label endpoints are present. Determine whether Admin should continue generating documents.
- **Sessions**: config selects database sessions (`ci_sessions`), with rp_ci_sessions in the dump. PHP serialized sessions cannot be reused as FastAPI authentication. Plan re-login and explicit trusted-device migration policy.
- **Scheduled jobs**: an admin Schedule controller and SDK scheduler classes exist; no deployed crontab or scheduler manifest was identified. Class/file names alone do not prove scheduled jobs. Obtain production schedule/runbook separately.

## Security findings (values suppressed)

1. Configuration and API/controller files contain embedded database/provider credential assignments. Potential secret-bearing locations include application/config/database.php, application/controllers/Account.php, Home.php, Checkout.php and api/generate-upload-url.php/api/db.php. Some are historical/commented, but exposure must be reviewed and live credentials rotated through an authorized separate task. No credentials appear in these reports.
2. application/config/config.php explicitly sets csrf_protection=FALSE, cookie_secure=FALSE and cookie_httponly=FALSE; modern auth must set secure cookies, appropriate SameSite/CSRF controls and expiry.
3. api/login.php compares a supplied password directly with the database value and enables error display. Do not migrate this authentication design or copy account hashes; use a reviewed password migration/reset strategy.
4. Selected standalone API files (upload signing, buyer listing, stage completion) have no visible per-request authorization gate in their local file bodies. Upstream proxy enforcement is unknown. Require explicit authentication, role/ownership checks and audit logging in replacements; never infer they are safe for anonymous clients.
5. api/generate-upload-url.php constructs signing keys from input and disables an SDK verification option. Review transport verification and storage-key validation. Never carry over insecure settings.
6. Legacy HTML is entity-decoded into templates. Treat CMS HTML as untrusted even when publication-enabled; sanitize allowed tags/URLs and protect against stored XSS.
7. Broad route surface includes upload/export/delete/test methods and obsolete unrelated modules. Do not reproduce those surfaces by default. Admin/operational endpoints require separate authentication scopes.
8. Source/public asset collections include plugin PHP upload handlers, demos, archives and unrelated scripts. Vite currently copies the entire public directory into dist. Restrict deployment assets to a reviewed allowlist and never serve PHP-capable handlers from the static webroot. Do not delete originals during an audit.

## Acceptance criteria before enabling writes

Use request/response schemas, size limits, anti-abuse protection, no secret/client-side credentials, clear validation/errors, audit correlation IDs, privacy retention rules and ownership checks. For payment/upload/invoice workflows, add idempotency and authorized integration tests against test environments. This audit did not run transactions, messages, uploads or any backend endpoint.

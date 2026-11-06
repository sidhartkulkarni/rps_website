# Reviewed URL handling — recommendations, not deployed

Source: `docs/legacy-audit/PAGE_CONTENT_MAPPING.md` configured-route inventory. The four aliases resolve to the same legacy controllers as their canonical pages. Existing React Navigate is a client-side replacement, not an HTTP permanent redirect. Live GET checks on 2026-11-07 returned 200 for all four.

| Verified source | Destination | Proposed status |
| --- | --- | --- |
| /about | /about-us | 308 (or 301) |
| /contact | /contact-us | 308 (or 301) |
| /how-it-work | /how-it-works | 308 (or 301) |
| /terms-conditions | /terms-and-conditions | 308 (or 301) |

Preserve query strings. Normalize trailing slash and `/index.html` only for the finite known public page set, including `/index.html` to `/`. Root remains `/`. Send www page requests to the same path on HTTPS apex after host-owner review; current www root is 200. HTTP apex currently correctly redirects 301 to HTTPS. Avoid redirect chains by resolving alias/slash/host in one hop where practical.

Local Vite **preview only** now models alias/slash redirects and real 404 responses for acceptance tests. Alias HTML remains as a compatibility fallback with canonical destination and noindex. Static files cannot emit HTTP redirect statuses. This repository change does not activate redirects on EC2. Review explicit GET/HEAD mappings against the existing website virtual host; exclude `/api/website/`, Admin and all unrelated routes. Do not install generic rewrite rules that normalize backend tokens or POSTs.

Unknown routes and unknown service slugs must remain HTTP 404, never homepage 200. Live `/seo-audit-not-a-page` already returns 404. Build now includes `404.html` with noindex and no canonical. A later approved host change may use it as a 404 body, retaining status 404. Preserve existing `try_files` unknown-path behavior; do not add SPA fallback to root. Keep existing no-trailing-slash canonical paths serving their route-specific `index.html` files directly.

Do **not** redirect legacy blog/news, product/cart/checkout, customer/account/admin, `post-job`, `post-jobs`, `article/:any`, or every `.php` path to Home. Audit records classify many as inherited or unverified. Obtain historic indexed URLs/Search Console export and prove equivalent content before mapping them. No speculative new redirects have been added. Four detail slugs remain unchanged.

Acceptance commands for a later operator review (read-only): `curl -I https://rapidpacknship.com/about`, `curl -I https://rapidpacknship.com/about-us/`, `curl -I https://www.rapidpacknship.com/`, `curl -I https://rapidpacknship.com/service-detail/not-a-service`. Validate status, Location, final 200/404 and query preservation after any approved deployment; run GET as well as HEAD. No Nginx changes were made.

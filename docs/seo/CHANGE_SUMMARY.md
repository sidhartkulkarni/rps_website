# SEO change inventory

Based on `b623e43` (production frontend baseline plus committed working backend/forms), no premium redesign. All changes local/uncommitted. Existing backend files unchanged.

| Files | Change |
| --- | --- |
| `frontend/package.json` | Build runs prerender after Vite. No new dependency. |
| `frontend/vite.config.ts` | Keep safe asset/sitemap/robots generation; move HTML generation to prerender; preview-only status/redirect handling. |
| `frontend/scripts/prerender.mjs` | Full canonical page HTML, head metadata, compatibility aliases and noindex 404. |
| `frontend/src/entry-static.tsx` | Shared-route static render entry. |
| `frontend/src/App.tsx` | Export shared routes without changing paths. |
| `frontend/src/main.tsx` | Hydrate static markup; retain client-render fallback for dev. |
| `frontend/src/data/seo.ts` | Supported titles/descriptions and typed schema generation. |
| `frontend/src/components/RoutePosition.tsx` | Synchronize metadata/schema after client navigation. |
| `frontend/src/data/imageDimensions.json` | Dimensions read from original media; no originals modified. |
| `frontend/src/components/PublicImage.tsx` | Intrinsic image sizes and asynchronous decoding. |
| `frontend/src/pages/Home.tsx`, `frontend/src/pages/About.tsx`, `frontend/src/components/ServiceCard.tsx` | Use sized images, preserve copy/alt text/lazy behavior. |
| `frontend/src/pages/ServiceDetail.tsx` | Sized image and related-service navigation. |
| `frontend/src/components/PageBanner.tsx` | Services parent in detail breadcrumb. |
| `frontend/src/pages/Services.tsx` | Clear inquiry link after existing packaging content. |
| `frontend/src/components/Header.tsx` | Existing public phone/email become actionable links. |
| `frontend/src/components/SubmissionForm.tsx` | Disable before hydration; explicit POST and no-JS guidance. Fetch/consent/idempotency contracts unchanged. |
| `frontend/scripts/validate-public-site.mjs` | Validate shipped initial HTML, OG/schema, canonical uniqueness and 404 policy. |
| `frontend/playwright.config.ts` | Test built preview instead of dev server. Build first. |
| `frontend/tests/seo.spec.ts` | Desktop/mobile, no-JS, metadata, hydration, redirects/404, menu and video behavior. |
| `scripts/deployment/package-release.py`, `scripts/deployment/install-release.py` | Permit only the additional explicit `404.html` artifact. |
| `scripts/deployment/test_release.py` | Verify custom 404 archive accepted. |
| `frontend/IMPLEMENTATION.md` | Current build and deployment boundaries. |
| `docs/seo/SEO_AUDIT.md` | Prioritized findings, evidence, routes, implementation and limitations. |
| `docs/seo/LIVE_ROUTE_EVIDENCE.json` | Read-only public GET results for 12 routes; no private data. |
| `docs/seo/REDIRECT_REVIEW.md` | Verified alias map and reviewed host recommendations, not installed. |
| `docs/seo/CONTENT_AND_SEARCH_CONSOLE.md` | Keyword mapping, five unapproved guide ideas, claims and monitoring checklist. |
| `docs/seo/CHANGE_SUMMARY.md` | This inventory and final validation results. |

No changes to branding CSS, media bytes, backend implementation, Admin/mobile, systemd, AWS, DNS, SSL or production Nginx. No real form submissions. dist/artifacts are ignored. Shared backend branch and premium branch retain their original commits.

## Final results

- Frontend production build and ESLint: passed.
- Public validator: 12 canonical page routes, four aliases, exact nine sitemap URLs, all internal links, one H1 per canonical page, initial HTML, canonical uniqueness, Open Graph and JSON-LD syntax passed.
- Chromium: 14 tests passed (six SEO/responsiveness/no-JS/navigation/media tests and eight existing contact/newsletter tests). Desktop 1280px and mobile 390px; no hydration errors or horizontal overflow detected.
- Deployment helper tests: 8 passed, including explicit 404 artifact validation.
- Repository security/asset scan: passed; all 32 original asset hashes match. No generated dist/screenshots in Git candidates. Heuristic scan does not certify absence of all secrets.
- `git diff --check`: passed; backend diff against b623e43 empty. Backend branch remains b623e43, premium UI remains 92a9dc3.
- Live read-only GET evidence: all 12 canonical pages 200, current raw HTML empty of H1/OG/schema. Four aliases and www/slash samples return 200; unknown sample 404; HTTP apex 301. These live issues are documented, not remotely changed.

Remaining: reviewed frontend release, approved host redirects/custom 404 wiring, business content/claims/legal approvals, media derivatives/captions and Search Console/field CWV verification. No real API submissions or production mail tests were performed for this SEO task.

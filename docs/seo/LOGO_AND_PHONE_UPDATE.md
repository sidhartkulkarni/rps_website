# Header animation and public phone update — 2026-11-08

Branch: `feature/seo-optimization`, starting at `383faa2`. No backend, Admin/mobile, production or premium-branch changes; no commit/push/release/deploy.

## Original animation evidence and restoration

Read-only local legacy sources:

- `local-private-assets/legacy-public/front_assets/css/custom.css:302–354`: header cover (`header-box`, 2.9 seconds linear, width 100% to zero) and 100px mascot (`header-ani`, 2.5 seconds linear, left zero to 100%).
- `local-private-assets/legacy-public/front_assets/images/header-vid.gif`: original 436×436 animated RPS mascot, visually inspected. Restored byte-for-byte to the same public URL path. It is distinct from the 800×450 `logo-video.gif` scene, which was inspected but not copied or used.
- `local-private-assets/legacy-public/front_assets/js/custom.js:151–156`: legacy jQuery removes `for-opacity` from `.logo-img` after 500 ms. No jQuery or delayed hiding of the clickable brand logo was imported.
- Git inspection of initial React commit `37cfffd`, SEO commit `383faa2` and read-only parked branch shows static header/logo markup; original header mascot effect was absent from the initial React implementation. SEO did not remove it. Original PHP header templates are not present locally, so exact historic template markup cannot be asserted; the matching CSS selector and recovered asset are the restoration evidence.

`HeaderAnimation` restores the matching mascot/reveal once per page load, after the GIF loads. It is absolutely positioned, clipped to the header and pointer-transparent. Original duration, linear easing, 100px mascot size and left-to-right movement are retained. The cover uses scaleX rather than animated width; the mascot remains out of normal flow. Both are removed after 2.9 seconds. Existing linked logo stays in place and interactive; SPA navigation does not replay the effect. Asset failure leaves the ordinary header visible.

Reduced-motion users receive the static logo and no GIF request. CSS additionally disables the animation if the preference changes. No animation dependency was added. All 32 prior media hashes are unchanged; one specifically reviewed original GIF increases the allowlist to 33. Its original size is about 2.2 MiB, a performance tradeoff of restoring the exact legacy media. No unapproved legacy scripts or other quarantined files were copied. Future optimized derivatives would require separate review.

## Public phone

`businessPhone` in `frontend/src/data/site.ts` is the shared source: `866-959-7447`, `tel:+18669597447`. Header, Footer, ContactSection (homepage) and Contact page use it. No phone existed in schema requiring replacement. CMS data and remaining frontend files were searched. Prerender regenerates canonical/alias shells, custom 404 and bundles with current contact information. Historical audit records and unrelated data remain unchanged.

## Validation

- Frontend build and lint passed.
- 18 Chromium browser tests passed, including desktop 1280px/mobile 390px animation checkpoints, fixed header/logo geometry, clickable homepage link, no replay on client navigation, reduced-motion/no-GIF request, all canonical-page telephone links, existing SEO and form regressions.
- Inspected animation screenshots at 300ms/1500ms on desktop and 1500ms on mobile. Screenshots remain ignored under `artifacts/`.
- Route/SEO validator passed: 12 canonical pages, aliases, nine sitemap URLs, canonical/JSON-LD/OG, initial HTML, internal links and labels.
- Recursive generated HTML/JS/CSS/XML/text/JSON scan found no previous business number; every detected `tel:` reference uses the new E.164 link. Browser checks verify visible phone labels on every page.
- Original 32 asset hashes unchanged; 33 approved build assets including restored GIF.
- Deployment helper tests and repository security checks passed; `git diff --check` clean. Security scan remains heuristic.
- Backend diff empty. Premium reference unchanged at `92a9dc3`. No live forms, SMTP or production service tests performed.

## Exact files changed

- `frontend/src/data/site.ts` — centralized public number.
- `frontend/src/components/Header.tsx` — animation component and phone constant.
- `frontend/src/components/Footer.tsx` — phone constant.
- `frontend/src/components/ContactSection.tsx` — phone constant.
- `frontend/src/pages/Contact.tsx` — phone constant.
- `frontend/src/components/HeaderAnimation.tsx` — accessible one-shot legacy animation.
- `frontend/src/App.css` — scoped legacy motion and reduced-motion override.
- `frontend/public/front_assets/images/header-vid.gif` — recovered original public mascot.
- `frontend/public/.gitignore` — allow only that additional reviewed asset.
- `frontend/public-assets.json`, `frontend/public-assets.lock.json` — asset entry and original hash.
- `frontend/vite.config.ts` — approved GIF MIME support.
- `frontend/tests/brand-contact.spec.ts` — animation, reduced-motion and phone regressions.
- `frontend/scripts/validate-public-site.mjs` — generated-build telephone assertions.
- `scripts/check_repository.py` — treat approved GIF as binary media during credential-pattern scanning.
- `scripts/deployment/install-release.py` — permit GIF media in static deployment archive boundary.
- `scripts/deployment/test_release.py` — synthetic GIF archive acceptance regression.
- `frontend/IMPLEMENTATION.md` — updated status.
- `docs/seo/LOGO_AND_PHONE_UPDATE.md` — this evidence and review record.

Remaining: owner visual review of restored legacy effect and approval of the next release. No functional blockers found; large original GIF is retained intentionally. Production is unchanged.

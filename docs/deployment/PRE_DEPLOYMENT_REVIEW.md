# Deployment preparation review

## Completed locally

- No existing root `.gitignore` and no Git commits/tracked files were present. Existing frontend/backend ignore files were retained; new root exclusions and a public-media allowlist protect future commits. No history rewrite or index changes were needed or performed.
- Original public inventory: 5,055 files, including 2,344 JS, 22 PHP and 23 ZIP files. All 5,023 non-approved files were moved intact to `local-private-assets/legacy-public`, which is ignored. Potentially private uploads were neither printed nor published. Existing local backups remain preserved.
- Public directory now holds 32 approved media files plus `.gitignore`. Thirty non-video files are Git-eligible. Two referenced MP4s (~234/311 MiB) stay ignored by Git and require the documented media-release bootstrap on fresh checkouts. All hashes and original URLs are retained.
- Compiled artifact: 52 files, ~561.1 MiB; no PHP, SQL, archives, source maps, `.env`, source tree, dependencies or backend. No Node runtime/build needed on EC2.
- Build gate: asset hashes; Git candidate paths/size/recognized credential patterns; frontend production build/lint; route/link/SEO/media checks; tar path/type/completeness/hash validation. A nonpublishable local preview is under ignored `artifacts/local-preview-1/`.
- Deployment helper tests use only temporary synthetic files: normal archive, traversal, symlink, duplicate, mismatched hash, unapproved file, preview rejection, staged file integrity, no automatic current-link change and overwrite refusal. No `/var/www` writes occurred.

## Routes verified

| Canonical route | Build result |
| --- | --- |
| `/` | HTML shell and approved media |
| `/about-us` | HTML shell and approved media |
| `/services` | HTML shell and approved media |
| `/service-detail/parcel-shipping` | HTML shell and approved media |
| `/service-detail/ltl-less-than-truckload-shipping` | HTML shell and approved media |
| `/service-detail/full-truckload-shipping` | HTML shell and approved media |
| `/service-detail/intermodal-global-shipping` | HTML shell and approved media |
| `/reviews` | HTML shell, verification notice, noindex |
| `/how-it-works` | HTML shell, both original videos and poster |
| `/contact-us` | HTML shell; API deployment remains separate |
| `/terms-and-conditions` | HTML shell; unavailable legal content, noindex |
| `/privacy-policy` | HTML shell; unavailable legal content, noindex |

Four alias shells (`/about`, `/contact`, `/how-it-work`, `/terms-conditions`) point canonically to their primary pages. Sitemap contains nine indexable URLs. React body rendering, host HTTP statuses and actual browser interaction are distinct from static checks.

## Manual approval before committing or publishing

1. Review all source/docs and staged files for secrets/private data. The heuristic scanner found no recognized credentials but is not a complete secret detector. Do not stage `local-private-assets`, legacy views, SQL, `.env`, raw exports, keys, dependencies, dist or artifact TARs; do not use `git add -f`.
2. Confirm GitHub repository identity, visibility, permissions and who may publish releases. No repository/remote was guessed. Approve a source commit and separate media/compiled release tags; current local preview cannot be installed.
3. Approve media publication rights and large-video delivery strategy. Current payload needs substantial disk despite low CPU use. Optimizing/transcoding or external media hosting requires separate approval; no required original media was removed or altered.
4. Approve real legal/privacy content, testimonial attribution and recovered business claims. These existing content limitations were not silently removed to enable launch.
5. Before deployment (not a prerequisite merely to commit tooling), approve domain/canonical/TLS and website-only Nginx routing alongside Admin, dedicated directory ownership and actual disk headroom. No host configuration is known/tested locally. No infrastructure changes are included.
6. Decide static launch behavior for contact/newsletter. Their API needs separate authorized deployment and SMTP setup. Nginx must return explicit 503 until ready, not route website submissions to Admin. Newsletter enrollment/confirmation remains separate.

Nothing was committed, pushed, uploaded to GitHub, deployed, or changed in Nginx/Docker/AWS/other repositories. Full runbook: [EC2_STATIC_WEBSITE.md](EC2_STATIC_WEBSITE.md).

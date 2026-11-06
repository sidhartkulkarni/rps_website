# Locally built website → GitHub Releases → host Nginx

Prepared only. No Git commit/push, GitHub release, EC2 login, Nginx modification, Docker action, AWS change, or deployment was performed. The Admin application and its repositories are outside this procedure.

## Layout and build boundary

- Source: this repository. Never clone the repository into the Nginx document root.
- Runtime: compiled frontend only, staged at `/var/www/rps-website/releases/<tag>`; Nginx should eventually use `/var/www/rps-website/current` as its website root. `/var/www/rps-website` is the dedicated deployment base.
- No Node, npm build, node_modules, Python backend, SQL, legacy PHP, audit reports, or `.env` belongs in that web directory. Existing FastAPI backend deployment is **not** part of this static release.
- `frontend/public` contains only 32 approved media files plus its `.gitignore`. 5,023 unrelated files were moved intact to ignored `local-private-assets/legacy-public`. Neither these files nor existing private backups were deleted. Keep the local archive outside future source distribution.
- `frontend/public-assets.json` is the approved path list; `public-assets.lock.json` pins all 32 sizes/SHA-256 values. Vite has `publicDir:false`, copies only those assets, empties dist on build, and emits no source maps. Twelve page HTML shells plus four aliases retain original routes/canonicals. These are React shells, not prerendered body content.
- `.gitignore` excludes private archives/uploads, databases/SQL/data exports, dependencies, runtime files, `.env`/keys and build artifacts. The reviewed `backend/.env.example` is a variable-name template, not working credentials. The safety gate rejects other environment-file candidates, even if force-added.

## Required media strategy

The approved English and Spanish MP4s are 245,735,442 and 326,020,706 bytes (~234 and ~311 MiB), respectively. Both are referenced by How It Works and preserved unchanged. They account for nearly all release size. They are deliberately ignored by Git; the other 30 approved assets are eligible for Git.

GitHub blocks ordinary Git files over 100 MiB; use explicitly uploaded release assets for these two files. See [GitHub large-file guidance](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github). This workflow does not introduce Git LFS or rely on GitHub's automatically generated source ZIP containing the videos.

After owner approval, source commit/push and repository selection, create a dedicated media release **from the machine holding the originals**. These are instructions only:

```sh
cd /path/to/rps_website
REPO='OWNER/REPOSITORY'                 # replace with approved GitHub repo
MEDIA_TAG='website-media-v1'
COMMIT="$(git rev-parse HEAD)"
python3 scripts/check_repository.py
# Review asset rights/content and lock hashes before uploading.
gh release create "$MEDIA_TAG" --repo "$REPO" --target "$COMMIT" --draft \
  --title 'Approved website source media v1' \
  --notes 'Two approved original public process videos; hashes pinned in public-assets.lock.json.' \
  frontend/public/uploads/cms/Rapid_and_ship_Video_Animation_Final_-_English.mp4 \
  frontend/public/uploads/cms/Rapid_and_ship_Video_Animation_Spanish_Final.mp4
# Review the draft and publish only after approval:
gh release edit "$MEDIA_TAG" --repo "$REPO" --draft=false
```

Use a dedicated immutable media tag; do not replace its assets silently. On a clean developer checkout (GitHub CLI authentication required for private repositories):

```sh
python3 scripts/deployment/fetch-media.py --repo OWNER/REPOSITORY --tag website-media-v1
```

Downloads are verified against committed hashes before copying to original paths; existing mismatched files are not overwritten. No credentials are stored by these scripts. Use approved GitHub CLI authentication; never put tokens into commands, URLs or committed files. Media rights/continued publication and repository visibility need owner approval.

## Local build and release preparation

Prerequisites: Node 22 (`.nvmrc`; use a currently patched Node 22), npm, Python 3.9+, Git and GitHub CLI. Python installer itself needs only the standard library; no Python packages are needed on EC2. Build on your development machine, not EC2.

This repository currently has no commits. Review changes and secret/private-content findings before manually committing/pushing. The build-release script refuses a publishable bundle unless the worktree is clean and HEAD exists. It never commits/pushes. Do not force-add ignored files.

```sh
cd /path/to/rps_website
nvm use
python3 scripts/check_repository.py
python3 scripts/deployment/test_release.py
# After manual review, commit and push approved source separately.
# On a clean checkout with the two approved videos present:
bash scripts/deployment/build-release.sh website-vYYYYMMDD-1
```

The script runs the asset/Git gate, `npm ci`, production build, 12-route/four-alias/media checks, ESLint, packaging and archive verification. A unique new tag/output directory is required. For local pre-commit verification only:

```sh
npm --prefix frontend run build
npm --prefix frontend run validate:public
npm --prefix frontend run lint
python3 scripts/deployment/package-release.py --tag local-preview-1 --allow-uncommitted
python3 scripts/deployment/install-release.py \
  --archive artifacts/local-preview-1/rps-website.tar \
  --manifest artifacts/local-preview-1/release-manifest.json --check-only
```

Preview manifests are marked nonpublishable and the installer rejects installation. Never upload preview bundles as production releases. Ignored `artifacts/<tag>/` contains:

- `rps-website.tar`: uncompressed compiled website only (low CPU extraction; MP4 recompression is wasteful).
- `release-manifest.json`: source commit, release tag, file list, sizes/hashes and publication eligibility.
- `install-release.py`: verifier/stager; stays outside document root.
- `SHA256SUMS`: checksums for these three files.

A clean worktree is provenance, not security approval. Review staged source and the exact release, scan with your organization's secret/security tooling and confirm repository access policy. The built-in scan is heuristic; it cannot certify no secrets, private content or vulnerable dependencies exist. Review any intentional asset update and refresh the lock explicitly; do not blindly regenerate it to bypass a mismatch.

## Manually publish the compiled release through GitHub

```sh
cd /path/to/rps_website
REPO='OWNER/REPOSITORY'
TAG='website-vYYYYMMDD-1'
COMMIT="$(git rev-parse HEAD)"
gh release create "$TAG" --repo "$REPO" --target "$COMMIT" --draft \
  --title "$TAG" --notes "Reviewed static website build from $COMMIT; no backend or Admin changes." \
  "artifacts/$TAG/rps-website.tar" "artifacts/$TAG/release-manifest.json" \
  "artifacts/$TAG/install-release.py" "artifacts/$TAG/SHA256SUMS"
# Review asset list/checksums and release permissions, then approve publication:
gh release edit "$TAG" --repo "$REPO" --draft=false
```

Do not download GitHub's automatically generated Source code ZIP for deployment. Use only the explicit compiled artifact. Checksums detect corruption, not a malicious release publisher; trusted repository permissions and reviewed commit/tag/checksum provenance remain essential. There is deliberately no automatic deployment workflow, EC2 credential, SSH action, or runner on EC2.

## EC2 prerequisites requiring operator approval

Before running ANY installation command, the operator must confirm:

1. Approved domain/canonical origin (`https://rapidpacknship.com` is currently hardcoded), DNS and TLS certificate ownership. Inspect host Nginx server-name routing to avoid colliding with Admin. Do not overwrite Admin config or set a new default server.
2. `/var/www/rps-website` is dedicated to this website and contains no Admin files. Determine service user/group and existing `disable_symlinks`/SELinux/filesystem policies. A host-level Nginx owner must approve routing and read access.
3. GitHub CLI/Python 3 are already available or their installation is separately approved. Read-only GitHub release access is sufficient on EC2. No npm/Node/Docker changes are required.
4. Disk headroom: current full payload is ~561 MiB. A download + staged release needs roughly 1.1 GiB **additional** disk, plus at least 256 MiB reserve and space for the existing release/logs. Keeping current + previous + download consumes roughly 1.65 GiB before other host use. Use `df -h /var/www /var/tmp`; do not use up space needed by Admin. Do not delete Admin files, Docker volumes, logs, or backups to make room. If space is inadequate, stop and approve video transcodes/external hosting separately; originals must not be removed speculatively.
5. Actual legal/privacy policies and testimonial/content claims remain approval blockers. Existing legal pages are placeholders/noindex.
6. Public API is a separate service. Until its authorized deployment, `/api/website/` must return an explicit 503, **not** proxy into Admin or fall back to index.html. Frontend forms already display failure honestly. SMTP and newsletter confirmation are not activated by this release.

## Exact EC2 staging commands (operator executes after approval)

These commands intentionally do not install packages, change Nginx or restart anything. Replace the approved repo/tag values. Run from a trusted operator session with an appropriate umask. Preserve the release files unchanged during verification/extraction.

```sh
set -euo pipefail
REPO='OWNER/REPOSITORY'
TAG='website-vYYYYMMDD-1'
BASE='/var/www/rps-website'
DOWNLOAD="/var/tmp/rps-website-$TAG"
umask 022
# Inspect available space BEFORE download. Stop if < about 1.4 GiB free in relevant filesystems.
df -h /var/www /var/tmp
# Provision only the dedicated website directory; if it already exists, review ownership first.
# First installation only, with operator approval:
sudo install -d -m 0755 -o "$(id -un)" -g "$(id -gn)" "$BASE"
# No recursive chown and no writes to existing Admin directories.
mkdir -m 0700 "$DOWNLOAD"
gh release download "$TAG" --repo "$REPO" --dir "$DOWNLOAD" \
  --pattern rps-website.tar --pattern release-manifest.json \
  --pattern install-release.py --pattern SHA256SUMS
cd "$DOWNLOAD"
# Compare this checksum file with the reviewed local release as well.
sha256sum --check SHA256SUMS
python3 install-release.py --archive rps-website.tar --manifest release-manifest.json --check-only
# Verify manifest tag/source commit match the approved release.
python3 -c 'import json; m=json.load(open("release-manifest.json")); print(m["tag"], m["source_commit"], m["publishable"])'
# Only now stage. Installer refuses preview, traversal, links, duplicates, bad hashes,
# unknown files in BASE, release overwrites and insufficient extraction disk space.
python3 install-release.py --archive rps-website.tar --manifest release-manifest.json --root "$BASE"
```

The stager never changes `current`. A failed extraction leaves a partial unreferenced release for explicit operator inspection; it does not delete files automatically. Pick a new tag after resolving a failure, or have the owner remove only the reviewed partial website release.

## Host Nginx handoff — documentation only

No config was created or modified. Ask the host Nginx owner to add the website to the approved virtual host with these **requirements**, preserving Admin routing:

- `root /var/www/rps-website/current;` and `index index.html;`.
- Known page HTML via `try_files $uri $uri/index.html =404;` (12 canonical pages and four alias shells exist). Unknown paths should be 404 rather than serving a misleading 200 SPA shell.
- `/api/website/` must be an explicit unavailable 503 until the separate public FastAPI service is approved; subsequently proxy only to that service. Never route to Admin APIs by analogy.
- Static assets/media must return real 404 for missing files, correct MIME types, `X-Content-Type-Options: nosniff` and normal Nginx byte-range support for MP4. Cache hashed `/assets/` long-term; HTML and unversioned original media should revalidate because their filenames are preserved.
- Deny dotfiles except intentional ACME handling. Never add PHP execution. Serve only compiled output. Review Google Fonts external access/CSP independently; don't copy a blanket policy that breaks video/fonts.
- Host owner must validate the complete existing configuration and follow the existing controlled reload process. This procedure does not provide or execute a blanket `systemctl restart nginx` command.

If the host is already configured correctly, switching the symlink below requires no Nginx reload. If it is not configured, staging alone will not make the site public; wait for the separately approved host configuration.

## Activation and rollback (separate explicit approval)

After artifact and host routing approval, in the same EC2 operator session:

```sh
set -euo pipefail
BASE='/var/www/rps-website'
TAG='website-vYYYYMMDD-1'
test -f "$BASE/releases/$TAG/index.html"
# Record the previous value in the release change record before switching.
readlink "$BASE/current" || true
# Refuse an existing real directory or leftover temporary symlink; inspect instead.
test ! -e "$BASE/current" || test -L "$BASE/current"
test ! -e "$BASE/current.next" && test ! -L "$BASE/current.next"
ln -s "releases/$TAG" "$BASE/current.next"
mv -Tf "$BASE/current.next" "$BASE/current"
```

Run the activation block with `set -e` so failed guards stop execution. Linux `mv -T` replaces the symlink atomically. It does not delete either release. Keep the previous release until browser smoke tests and an agreed rollback window finish. Roll back by substituting the recorded previous tag in the same guarded switch. Do not delete old release directories automatically; first review disk needs, active/previous links and retention approval. Completed download TARs can be removed by the operator from the exact private download directory after checksum/provenance records are retained, not from arbitrary `/var/tmp` paths.

Smoke tests after approved activation: check HTTPS home, all 12 routes, aliases, canonical tags, missing route/asset 404, both MP4 range requests (206), logo/service images, no source/PHP/SQL access, API unavailable or correct website service behavior, and Admin health unchanged. Browser desktop/mobile, keyboard navigation and actual host TLS/routing are manual checks; local validation is not evidence they passed.

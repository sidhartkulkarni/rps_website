#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
if [[ $# -ne 1 ]]; then echo 'Usage: bash scripts/deployment/build-release.sh website-vYYYYMMDD-N' >&2; exit 2; fi
cd "$REPO_ROOT"
python3 scripts/check_repository.py
cd frontend
npm ci
npm run build
npm run validate:public
npm run lint
cd "$REPO_ROOT"
python3 scripts/deployment/package-release.py --tag "$1"
python3 scripts/deployment/install-release.py --archive "artifacts/$1/rps-website.tar" --manifest "artifacts/$1/release-manifest.json" --check-only

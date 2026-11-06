# Isolated website API deployment and rollback

**Operator runbook only; nothing here has been executed on EC2.** Requires approval before release upload, service installation or Nginx edits. Production frontend `website-v20261106-1`, premium UI, Admin containers, other virtual hosts, DNS and SSL remain unchanged. Use a reviewed committed backend revision when publishing; this working tree is not a release.

## Prerequisites

Confirm Python 3.11+, disk/RAM headroom and unused loopback port 8017 (`python3 --version`, `df -h`, `free -m`, `sudo ss -ltnp`). Approve dedicated service account, 256 MB memory/50% CPU limits and one worker. Obtain working SMTP hostname/port/TLS mode, username/password, verified sender and business recipient. Confirm outbound SMTP access and SPF/DKIM/DMARC with provider. No AWS resources or Admin database are required.

Approve newsletter privacy, consent and retention disclosures. SQLite contains encrypted subscriber addresses, not inquiry bodies. Keep stable encryption/HMAC keys and protected backups outside the repository. No campaign mail sender is included.

## Package locally after review

Run from repository root; package only runtime files, never `.env`, databases, caches or source backups:

```sh
RELEASE=website-api-YYYYMMDD-1
mkdir -p artifacts
COPYFILE_DISABLE=1 tar -czf "artifacts/$RELEASE.tar.gz" --exclude='__pycache__' --exclude='*.pyc' -C backend app requirements.txt requirements.lock.txt deploy
shasum -a 256 "artifacts/$RELEASE.tar.gz"
```

Review archive listing with `tar -tzf`. Upload the reviewed archive through your approved GitHub release or SCP process. Record its revision and SHA256. Do not automatically publish this uncommitted tree. EC2 does not build React or install Node dependencies.

## Install isolated runtime on EC2

After uploading the archive to the operator's home directory and verifying its SHA256:

```sh
RELEASE=website-api-YYYYMMDD-1
sudo useradd --system --user-group --home-dir /nonexistent --shell /usr/sbin/nologin rps-website-api
sudo install -d -m 0755 /opt/rps-website-api/releases
sudo install -d -m 0700 -o rps-website-api -g rps-website-api /var/lib/rps-website-api
sudo install -d -m 0700 /etc/rps-website-api
sudo install -d -m 0755 "/opt/rps-website-api/releases/$RELEASE"
sudo tar -xzf "$HOME/$RELEASE.tar.gz" --no-same-owner -C "/opt/rps-website-api/releases/$RELEASE"
sudo python3 -m venv "/opt/rps-website-api/releases/$RELEASE/.venv"
sudo "/opt/rps-website-api/releases/$RELEASE/.venv/bin/pip" install --only-binary=:all: --no-cache-dir -r "/opt/rps-website-api/releases/$RELEASE/requirements.lock.txt"
```

Skip `useradd` if this exact dedicated account already exists and has been verified. Abort if wheel installation or Python compatibility fails; do not compile on the constrained host. For first installation, create the environment file with `sudo install -m 0600 /dev/null /etc/rps-website-api/environment`; **never overwrite an existing file**. Edit with `sudoedit /etc/rps-website-api/environment`, without displaying secrets in logs:

```ini
WEBSITE_ENVIRONMENT=production
WEBSITE_PROVIDER=smtp
WEBSITE_ALLOWED_ORIGINS=["https://rapidpacknship.com"]
WEBSITE_PUBLIC_ORIGIN=https://rapidpacknship.com
WEBSITE_LEDGER_PATH=/var/lib/rps-website-api/delivery.sqlite3
WEBSITE_FINGERPRINT_SECRET=<stable random secret at least 32 characters>
WEBSITE_SUBSCRIBER_ENCRYPTION_KEY=<Fernet.generate_key() value>
WEBSITE_SMTP_HOST=smtp.gmail.com
WEBSITE_SMTP_PORT=587
WEBSITE_SMTP_TLS=starttls
WEBSITE_SMTP_USERNAME=<provider username>
WEBSITE_SMTP_PASSWORD=<provider password>
WEBSITE_MAIL_FROM=noreply@rapidpacknship.com
WEBSITE_MAIL_FROM_NAME=RapidPacknShip
WEBSITE_MAIL_TO=mark@rapidpacknship.com
WEBSITE_MAIL_REPLY_TO=mark@rapidpacknship.com
# Approve shared Google account capacity before enabling:
WEBSITE_GLOBAL_LIMIT=5
```

Use secure secret tooling to generate/store keys, never commit them. Defaults and optional bounded timeouts/quotas are in `backend/.env.example`. Add alternate origins only when explicitly approved and actually served. EnvironmentFile quoting must preserve password characters.

```sh
sudo ln -sfn "/opt/rps-website-api/releases/$RELEASE" /opt/rps-website-api/current
sudo install -m 0644 /opt/rps-website-api/current/deploy/rps-website-api.service /etc/systemd/system/
sudo install -m 0644 /opt/rps-website-api/current/deploy/rps-website-retention.service /etc/systemd/system/
sudo install -m 0644 /opt/rps-website-api/current/deploy/rps-website-retention.timer /etc/systemd/system/
sudo systemd-analyze verify /etc/systemd/system/rps-website-api.service /etc/systemd/system/rps-website-retention.service /etc/systemd/system/rps-website-retention.timer
sudo systemctl daemon-reload
sudo systemctl start rps-website-api
curl --fail --max-time 15 http://127.0.0.1:8017/api/website/health
sudo systemctl status rps-website-api --no-pager
```

Keep Nginx's 503 fallback until readiness passes and controlled test mail reaches an approved inbox. Exercise contact, confirmation (including expired/invalid token), unsubscribe and same-key replay using synthetic data. Do not use customer records. SMTP NOOP alone does not validate sender permissions, inbox delivery or bounce handling.

## Enable proxy only after approval

The actual website virtual-host path is intentionally not guessed. Identify the file serving `rapidpacknship.com` and set `WEBSITE_VHOST` to its resolved path. Back it up root-only. Replace **only** the existing `/api/website/` 503 location with `backend/deploy/website-api-proxy.conf.example`, using `sudoedit "$WEBSITE_VHOST"`. Do not create a second conflicting location or change SSL/static/Admin routes. Review the diff locally without publishing configuration secrets.

```sh
sudo nginx -t
# Only after a successful check:
sudo systemctl reload nginx
curl --fail --max-time 15 https://rapidpacknship.com/api/website/health
sudo systemctl enable rps-website-api
sudo systemctl enable --now rps-website-retention.timer
```

Proxy template binds to localhost, overwrites forwarded client IP, limits bodies and disables sensitive access logging. Do not trust arbitrary X-Forwarded-For or expose 8017 externally. Review host-level connection/header limits and slow-client protection before enabling; proxy body timeout is idle-based, not a total slow-upload deadline. App quotas are not DDoS protection. Monitor resource usage, 429/503 counts, SMTP bounces and database disk growth. Frontend improved retry handling requires a separately approved static release; existing production frontend is not altered by this backend installation.

## Rollback preserving 503

First replace only the website API location with its saved original 503 block (or `website-api-fallback.conf.example`). Run `sudo nginx -t`, then `sudo systemctl reload nginx`. Verify `curl -i https://rapidpacknship.com/api/website/health` returns 503 and the homepage still loads. Do not restore an entire stale virtual host over subsequent unrelated changes.

```sh
sudo systemctl disable --now rps-website-api
sudo systemctl disable --now rps-website-retention.timer
```

Leave `/var/lib/rps-website-api` and secret keys intact. Do not roll back subscriber data: that could undo unsubscribes. For a code rollback, retain fallback, review schema compatibility, repoint `/opt/rps-website-api/current` to the previous reviewed release, restart only `rps-website-api`, repeat local checks and then re-enable proxy. Never stop/rebuild Admin Docker containers. Remove old release directories only after explicit retention approval.


## Gmail-specific verification gate

Use the full `backend/deploy/production.env.example` reference and read [SMTP review](../integration/GMAIL_SMTP_REVIEW.md). Do not read/copy Admin secrets into a package or source tree. An authorized operator provisions the website environment through the approved secret channel; do not rotate Admin credentials. Use a website-specific app password if account policy permits, understanding it shares the account quota. Check actual account headroom before enabling; the example quota is not a reservation for Admin.

Verify environment permissions without displaying contents:

```sh
sudo chown root:root /etc/rps-website-api/environment
sudo chmod 0700 /etc/rps-website-api
sudo chmod 0600 /etc/rps-website-api/environment
sudo stat -c '%U:%G %a %n' /etc/rps-website-api /etc/rps-website-api/environment
sudo ss -ltnp 'sport = :8017'
curl --fail --max-time 15 http://127.0.0.1:8017/api/website/health
```

Systemd reads the root-only EnvironmentFile and passes it to the dedicated process; do not make the file world-readable or source it in a shell. Keep secrets out of `systemctl show`, debug output, shell history, diagnostics and support tickets. Keep persistent keys unchanged on upgrades.

After approval, perform one synthetic contact submission and one newsletter request to an operator-controlled mailbox, with a new UUID for each. Local POSTs may use `http://127.0.0.1:8017/api/website/contact` and `/newsletter` with `Content-Type: application/json`, `Idempotency-Key` and the schemas in backend/README.md. Do not load-test Gmail. Record status and random request ID only; never publish the received tokens, email content or environment. Keep the original UUID for a replay test and verify only one mail arrives. If acceptance is uncertain, stop; do not generate another key.

Verify Mark receives the contact with `RapidPacknShip <noreply@rapidpacknship.com>` From and operator mailbox Reply-To. Inspect received authentication results for SPF/DKIM/DMARC and verify no Google sender rewriting. For newsletter mail, verify subscriber destination, business Reply-To `mark@rapidpacknship.com`, HTTPS confirmation/cancellation URLs on `rapidpacknship.com`, and no active membership before explicit confirmation. Use an approved inbox to check spam placement as well as acceptance.

Public confirmation links remain behind 503 until the approved proxy switch. Once enabled, confirm through the email link, repeat confirmation safely, unsubscribe, and verify the old confirmation cannot reactivate membership. GET alone must not change membership. Do not paste tokens into curl URLs or logs. Verify the homepage and existing Admin availability without modifying or submitting Admin data. If any check fails, restore the 503 location first and stop only the website service using the rollback steps above.

Authenticated NOOP is a dependency check, not a mail quota/deliverability check. Review Google sending reports through the account owner using aggregate counts; monitor transactional notifications and disable website delivery if it threatens their quota. No Admin restart, Docker action, DNS or SSL change is required.

"""Website-only consent lifecycle. Email ciphertext; opaque signed links; no GET mutations."""
import hmac
import time
from cryptography.fernet import Fernet
from app.core.errors import APIError


class NewsletterStore:
    def __init__(self, ledger, settings):
        self.ledger, self.settings = ledger, settings
        key = settings.subscriber_encryption_key.get_secret_value()
        self.cipher = Fernet(key.encode()) if key else None
        with ledger.connection() as db:
            db.execute('''CREATE TABLE IF NOT EXISTS subscribers (
                address_key TEXT PRIMARY KEY, email_ciphertext BLOB,
                generation TEXT UNIQUE, state TEXT NOT NULL CHECK(state IN ('pending','active','unsubscribed')),
                expires REAL, created REAL, updated REAL, confirmed REAL,
                consent_version TEXT NOT NULL)''')
            db.execute('''CREATE TABLE IF NOT EXISTS newsletter_mail_attempts (
                request_id TEXT PRIMARY KEY, address_key TEXT, created REAL)''')
            db.execute('CREATE INDEX IF NOT EXISTS newsletter_attempt_address ON newsletter_mail_attempts(address_key, created)')
            db.execute('CREATE TABLE IF NOT EXISTS store_keys (id INTEGER PRIMARY KEY, fingerprint TEXT, probe BLOB)')
            if self.cipher:
                db.execute('BEGIN IMMEDIATE')
                row = db.execute('SELECT fingerprint, probe FROM store_keys WHERE id = 1').fetchone()
                fingerprint = ledger.digest('website-store-key-v1')
                if row:
                    try:
                        if not hmac.compare_digest(row[0], fingerprint) or self.cipher.decrypt(row[1]) != b'website-store-v1':
                            raise ValueError()
                    except Exception:
                        raise ValueError('Website store keys do not match; explicit migration required') from None
                else:
                    db.execute('INSERT INTO store_keys VALUES (1, ?, ?)', (fingerprint, self.cipher.encrypt(b'website-store-v1')))

    def token(self, kind, generation):
        value = f'{kind}.{generation}'
        return value + '.' + self.ledger.digest('newsletter-link-v1:' + value)

    def prepare(self, email, request_id):
        if not self.cipher:
            raise APIError(503, 'newsletter_unavailable', 'Newsletter delivery is unavailable.', True)
        now = time.time()
        # Preserve SMTP local-part case; the schema canonicalizes the domain.
        address_key = self.ledger.digest('newsletter-address:' + email)
        generation = request_id.replace('-', '')
        with self.ledger.connection() as db:
            db.execute('BEGIN IMMEDIATE')
            previous = db.execute('SELECT address_key FROM newsletter_mail_attempts WHERE request_id = ?', (request_id,)).fetchone()
            row = db.execute('SELECT generation, state, expires FROM subscribers WHERE address_key = ?', (address_key,)).fetchone()
            if previous:
                if previous[0] != address_key or not row or row[1] == 'unsubscribed' or (row[1] == 'pending' and row[2] < now):
                    raise APIError(409, 'request_expired', 'This request is no longer valid. Start a new subscription request.')
            else:
                attempts = db.execute('SELECT count(*), max(created) FROM newsletter_mail_attempts WHERE address_key = ? AND created > ?', (address_key, now - 86400)).fetchone()
                if attempts[0] >= self.settings.newsletter_daily_limit or (attempts[1] and now - attempts[1] < self.settings.newsletter_cooldown):
                    raise APIError(429, 'rate_limited', 'Please wait before requesting another confirmation email.', True, {'Retry-After': str(self.settings.newsletter_cooldown)})
                db.execute('INSERT INTO newsletter_mail_attempts VALUES (?, ?, ?)', (request_id, address_key, now))
            if row and row[1] != 'unsubscribed' and (row[1] == 'active' or row[2] >= now):
                generation = row[0]
            else:
                encrypted = self.cipher.encrypt(email.encode())
                db.execute('''INSERT INTO subscribers VALUES (?, ?, ?, 'pending', ?, ?, ?, NULL, 'newsletter-v1')
                    ON CONFLICT(address_key) DO UPDATE SET email_ciphertext=excluded.email_ciphertext,
                    generation=excluded.generation, state='pending', expires=excluded.expires,
                    updated=excluded.updated, confirmed=NULL, consent_version='newsletter-v1' ''',
                           (address_key, encrypted, generation, now + self.settings.confirmation_ttl, now, now))
        base = self.settings.public_origin + '/api/website/newsletter/'
        return {'email': email,
                'confirm_url': base + 'confirm#token=' + self.token('confirm', generation),
                'unsubscribe_url': base + 'unsubscribe#token=' + self.token('unsubscribe', generation)}

    def act(self, kind, token):
        parts = token.split('.')
        if len(parts) != 3 or parts[0] != kind or not hmac.compare_digest(token, self.token(kind, parts[1])):
            raise APIError(400, 'invalid_link', 'This link is invalid. Please use the link in your email.')
        now = time.time()
        with self.ledger.connection() as db:
            db.execute('BEGIN IMMEDIATE')
            row = db.execute('SELECT state, expires FROM subscribers WHERE generation = ?', (parts[1],)).fetchone()
            if not row:
                raise APIError(410, 'expired_link', 'This link has expired. Request a new confirmation email.')
            if kind == 'confirm':
                if row[0] == 'unsubscribed' or (row[0] != 'active' and row[1] < now):
                    raise APIError(410, 'expired_link', 'This confirmation has expired or was cancelled. Request a new confirmation email.')
                if row[0] != 'active':
                    db.execute("UPDATE subscribers SET state='active', confirmed=?, updated=? WHERE generation=?", (now, now, parts[1]))
                return {'status': 'confirmed', 'message': 'Your newsletter subscription is confirmed.'}
            db.execute("UPDATE subscribers SET state='unsubscribed', email_ciphertext=NULL, updated=? WHERE generation=?", (now, parts[1]))
            return {'status': 'unsubscribed', 'message': 'You are unsubscribed. No newsletter emails will be sent.'}

    def check(self):
        if not self.cipher:
            return False
        with self.ledger.connection() as db:
            row = db.execute('SELECT probe FROM store_keys WHERE id=1').fetchone()
        return bool(row and self.cipher.decrypt(row[0]) == b'website-store-v1')

    def prune(self):
        cutoff = time.time() - self.settings.subscriber_retention_days * 86400
        with self.ledger.connection() as db:
            db.execute("DELETE FROM subscribers WHERE state != 'active' AND updated < ?", (cutoff,))
            db.execute('DELETE FROM newsletter_mail_attempts WHERE created < ?', (cutoff,))

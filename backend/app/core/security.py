"""Metadata only. Shared SQLite file coordinates workers on ONE host, not replicas."""
from contextlib import contextmanager
import os
from pathlib import Path
import hashlib
import hmac
import json
import sqlite3
import time
import uuid
from app.core.errors import APIError


class Ledger:
    def __init__(self, settings):
        self.settings = settings
        path = Path(settings.ledger_path)
        if path.is_symlink():
            raise ValueError('Linked storage is not allowed')
        try:
            fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
            os.close(fd)
        except FileExistsError:
            pass
        if settings.environment == 'production' and path.stat().st_mode & 0o077:
            raise ValueError('Website storage must have service-only permissions')
        with self.connection() as db:
            db.execute('CREATE TABLE IF NOT EXISTS deliveries (key TEXT PRIMARY KEY, fingerprint TEXT, state TEXT, request_id TEXT, created REAL)')
            db.execute('CREATE TABLE IF NOT EXISTS attempts (client TEXT, created REAL)')
            db.execute('CREATE INDEX IF NOT EXISTS attempts_created ON attempts(created)')
            db.execute('CREATE INDEX IF NOT EXISTS attempts_client ON attempts(client)')
            db.execute('CREATE TABLE IF NOT EXISTS readiness (id INTEGER PRIMARY KEY, value INTEGER)')

    @contextmanager
    def connection(self):
        db = sqlite3.connect(self.settings.ledger_path, timeout=5)
        try:
            with db:
                yield db
        finally:
            db.close()

    def digest(self, value):
        return hmac.new(self.settings.fingerprint_secret.get_secret_value().encode(), value.encode(), hashlib.sha256).hexdigest()

    def claim(self, kind, key, payload, client):
        now = time.time()
        key = self.digest(kind + ':' + key)
        fingerprint = self.digest(json.dumps(payload, sort_keys=True))
        with self.connection() as db:
            db.execute('BEGIN IMMEDIATE')
            db.execute('DELETE FROM attempts WHERE created < ?', (now - self.settings.rate_window,))
            # Seven-day replay window. Clients must not retry after this window.
            db.execute('DELETE FROM deliveries WHERE created < ?', (now - 7 * 86400,))
            row = db.execute('SELECT fingerprint, state, request_id FROM deliveries WHERE key = ?', (key,)).fetchone()
            if row:
                if row[0] != fingerprint:
                    result = ('conflict', row[2])
                elif row[1] == 'sent':
                    result = ('sent', row[2])
                elif row[1] != 'failed':
                    result = ('uncertain', row[2])
                else:
                    db.execute("UPDATE deliveries SET state = 'processing' WHERE key = ?", (key,))
                    result = ('send', row[2])
            else:
                request_id = str(uuid.uuid4())
                db.execute('INSERT INTO deliveries VALUES (?, ?, ?, ?, ?)', (key, fingerprint, 'processing', request_id, now))
                result = ('send', request_id)
        return key, result

    def finish(self, key, state):
        with self.connection() as db:
            db.execute('UPDATE deliveries SET state = ? WHERE key = ?', (state, key))

    def limit(self, client):
        now = time.time()
        with self.connection() as db:
            db.execute('BEGIN IMMEDIATE')
            db.execute('DELETE FROM attempts WHERE created < ?', (now - self.settings.rate_window,))
            client_hash = self.digest(client)
            count = db.execute('SELECT count(*) FROM attempts WHERE client = ?', (client_hash,)).fetchone()[0]
            total = db.execute('SELECT count(*) FROM attempts').fetchone()[0]
            if count >= self.settings.rate_limit or total >= self.settings.global_limit:
                raise APIError(429, 'rate_limited', 'Too many requests. Please try later.', retryable=True, headers={'Retry-After': str(self.settings.rate_window)})
            db.execute('INSERT INTO attempts VALUES (?, ?)', (client_hash, now))

    def check(self):
        with self.connection() as db:
            db.execute('INSERT OR REPLACE INTO readiness VALUES (1, 1)')
        return True

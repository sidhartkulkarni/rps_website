import threading
import time


class Readiness:
    def __init__(self, ledger, newsletter, delivery, settings):
        self.ledger, self.newsletter, self.delivery, self.settings = ledger, newsletter, delivery, settings
        self.lock = threading.Lock()
        self.checked_at = 0
        self.result = None

    def check(self):
        with self.lock:
            if self.result is not None and time.monotonic() - self.checked_at < self.settings.health_cache_seconds:
                return self.result
            checks = {}
            for name, check in [('storage', self.ledger.check), ('subscriber_storage', self.newsletter.check), ('smtp', self.delivery.check)]:
                try:
                    checks[name] = 'ok' if check() else 'unavailable'
                except Exception:
                    checks[name] = 'unavailable'
            ready = all(value == 'ok' for value in checks.values())
            self.result = (200 if ready else 503, {'status': 'ok' if ready else 'unavailable', 'checks': checks})
            self.checked_at = time.monotonic()
            return self.result

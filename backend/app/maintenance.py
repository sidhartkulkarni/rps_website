"""Prune only expired website metadata. No record values are displayed."""
import argparse
from app.core.config import Settings
from app.core.security import Ledger
from app.services.newsletter import NewsletterStore


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--prune', action='store_true', required=True)
    parser.parse_args()
    settings = Settings()
    ledger = Ledger(settings)
    NewsletterStore(ledger, settings).prune()
    with ledger.connection() as db:
        db.execute("DELETE FROM deliveries WHERE created < strftime('%s','now') - 604800")
        db.execute("DELETE FROM attempts WHERE created < strftime('%s','now') - ?", (settings.rate_window,))
    print('Website retention maintenance completed; no records displayed.')


if __name__ == '__main__':
    main()

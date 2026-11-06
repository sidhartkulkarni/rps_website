import time
from urllib.parse import urlsplit, parse_qs
from uuid import uuid4
from cryptography.fernet import Fernet
from fastapi.testclient import TestClient
import pytest
from app.main import create_app
from app.core.config import Settings
from app.services.delivery import Unavailable


class Mailbox:
    def __init__(self):
        self.messages = []
        self.unavailable = False
        self.health_calls = 0
    def send(self, kind, payload, request_id):
        if self.unavailable: raise Unavailable()
        self.messages.append((kind, payload, request_id))
    def check(self):
        self.health_calls += 1
        return not self.unavailable


@pytest.fixture
def context(tmp_path):
    settings = Settings(ledger_path=str(tmp_path/'db'), subscriber_encryption_key=Fernet.generate_key().decode(), rate_limit=100)
    mailbox = Mailbox()
    app = create_app(settings, mailbox)
    with TestClient(app) as client:
        yield client, mailbox, app, settings


def request(client, key=None, email='reader@example.com'):
    return client.post('/api/website/newsletter', json={'email':email,'consent':True}, headers={'Idempotency-Key':key or str(uuid4())})


def token(url):
    return parse_qs(urlsplit(url).fragment)['token'][0]


def state(app):
    with app.state.ledger.connection() as db:
        return db.execute('SELECT state, email_ciphertext, confirmed FROM subscribers').fetchone()


def test_double_opt_in_unsubscribe_and_replay(context):
    client, mailbox, app, settings = context
    key = str(uuid4())
    response = request(client,key)
    assert response.status_code == 200
    assert state(app)[0] == 'pending'
    assert state(app)[2] is None
    assert request(client,key).json() == response.json()
    assert len(mailbox.messages) == 1
    payload = mailbox.messages[0][1]
    assert 'reader@example.com' not in payload['confirm_url']
    confirm = token(payload['confirm_url'])
    unsubscribe = token(payload['unsubscribe_url'])
    assert client.get('/api/website/newsletter/confirm').status_code == 200
    assert state(app)[0] == 'pending'  # Link scanners cannot mutate state.
    for _ in range(2):
        assert client.post('/api/website/newsletter/confirm',json={'token':confirm}).json()['status'] == 'confirmed'
    assert state(app)[0] == 'active' and state(app)[2]
    assert client.get('/api/website/newsletter/unsubscribe').status_code == 200
    assert state(app)[0] == 'active'
    for _ in range(2):
        assert client.post('/api/website/newsletter/unsubscribe',json={'token':unsubscribe}).status_code == 200
    assert state(app)[0] == 'unsubscribed' and state(app)[1] is None
    assert client.post('/api/website/newsletter/confirm',json={'token':confirm}).status_code == 410
    data = open(settings.ledger_path,'rb').read()
    assert b'reader@example.com' not in data
    assert confirm.encode() not in data


def test_expiry_tampering_wrong_purpose_and_email_cooldown(context):
    client, mailbox, app, _ = context
    assert request(client).status_code == 200
    assert request(client).status_code == 429
    value = token(mailbox.messages[0][1]['confirm_url'])
    tampered = value[:-1] + ('1' if value[-1] != '1' else '2')
    assert client.post('/api/website/newsletter/confirm',json={'token':tampered}).status_code == 400
    assert client.post('/api/website/newsletter/unsubscribe',json={'token':value}).status_code == 400
    with app.state.ledger.connection() as db:
        db.execute('UPDATE subscribers SET expires = ?', (time.time()-1,))
    assert client.post('/api/website/newsletter/confirm',json={'token':value}).status_code == 410
    assert state(app)[0] == 'pending'


def test_delivery_failure_retry_no_false_subscription(context):
    client, mailbox, app, _ = context
    mailbox.unavailable = True
    key = str(uuid4())
    result = request(client,key)
    assert result.status_code == 503 and result.json()['retryable'] is True
    assert state(app)[0] == 'pending'
    mailbox.unavailable = False
    assert request(client,key).status_code == 200
    assert len(mailbox.messages) == 1


def test_health_cached_and_dependency_failure(context):
    client, mailbox, app, settings = context
    assert client.get('/api/website/health').status_code == 200
    assert client.get('/api/website/health').status_code == 200
    assert mailbox.health_calls == 1
    mailbox.unavailable = True
    app.state.readiness.checked_at = 0
    response = client.get('/api/website/health')
    assert response.status_code == 503
    assert response.json()['checks']['smtp'] == 'unavailable'
    assert 'example.com' not in response.text
    assert response.headers['cache-control'] == 'no-store'
    app.state.readiness.checked_at = 0
    app.state.ledger.check = lambda: False
    assert client.get('/api/website/health').json()['checks']['storage'] == 'unavailable'


def test_pages_security_headers(context):
    client = context[0]
    response = client.get('/api/website/newsletter/confirm')
    assert "frame-ancestors 'none'" in response.headers['content-security-policy']
    assert response.headers['referrer-policy'] == 'no-referrer'
    assert 'no-store' in response.headers['cache-control']
    assert 'type="email"' not in response.text
    assert 'history.replaceState' in response.text


def test_resubscribe_new_tokens_and_retention(context):
    client, mailbox, app, settings = context
    assert request(client).status_code == 200
    old = mailbox.messages[-1][1]
    assert client.post('/api/website/newsletter/unsubscribe',json={'token':token(old['unsubscribe_url'])}).status_code == 200
    with app.state.ledger.connection() as db:
        db.execute('UPDATE newsletter_mail_attempts SET created = ?', (time.time()-settings.newsletter_cooldown-1,))
    assert request(client).status_code == 200
    new = mailbox.messages[-1][1]
    assert new['confirm_url'] != old['confirm_url']
    assert client.post('/api/website/newsletter/confirm',json={'token':token(old['confirm_url'])}).status_code == 410
    assert client.post('/api/website/newsletter/confirm',json={'token':token(new['confirm_url'])}).status_code == 200
    with app.state.ledger.connection() as db:
        db.execute('UPDATE subscribers SET updated = 0')
    app.state.newsletter.prune()
    assert state(app)[0] == 'active'
    client.post('/api/website/newsletter/unsubscribe',json={'token':token(new['unsubscribe_url'])})
    with app.state.ledger.connection() as db: db.execute('UPDATE subscribers SET updated = 0')
    app.state.newsletter.prune()
    assert state(app) is None


def test_key_rotation_rejected(context):
    _, _, app, settings = context
    from app.services.newsletter import NewsletterStore
    settings.subscriber_encryption_key = Fernet.generate_key().decode()
    from pydantic import SecretStr
    settings.subscriber_encryption_key = SecretStr(settings.subscriber_encryption_key)
    with pytest.raises(ValueError, match='keys do not match'):
        NewsletterStore(app.state.ledger,settings)

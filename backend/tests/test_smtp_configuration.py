"""Synthetic transport checks: never connect to Google or send real mail."""
from email import policy
from email.parser import BytesParser
from uuid import uuid4
import pytest
from cryptography.fernet import Fernet
from app.core.config import Settings
from app.core.security import Ledger
from app.services.delivery import SMTPDelivery
from app.services.newsletter import NewsletterStore


@pytest.mark.parametrize('kind', ['contact', 'newsletter'])
def test_gmail_transport_envelope_and_headers(monkeypatch, kind):
    captured = {}
    class SMTP:
        def __init__(self, **kwargs): captured['options'] = kwargs
        async def connect(self): pass
        async def login(self, username, password): captured['authenticated'] = True
        async def sendmail(self, sender, recipients, body):
            captured.update(sender=sender, recipients=recipients, message=BytesParser(policy=policy.default).parsebytes(body))
            return {}, 'ok'
        async def quit(self): pass
        def close(self): pass
    monkeypatch.setattr('app.services.delivery.aiosmtplib.SMTP', SMTP)
    settings = Settings(provider='smtp', smtp_host='smtp.gmail.com', smtp_port=587,
                        smtp_tls='starttls', smtp_username='synthetic@example.com', smtp_password='test-only',
                        mail_from='noreply@rapidpacknship.com', mail_to='mark@rapidpacknship.com',
                        mail_reply_to='mark@rapidpacknship.com', mail_from_name='RapidPacknShip')
    payload = dict(email='customer@example.com', name='Test', subject='Question', message='Synthetic test',
                   confirm_url='https://rapidpacknship.com/api/website/newsletter/confirm#token=test',
                   unsubscribe_url='https://rapidpacknship.com/api/website/newsletter/unsubscribe#token=test')
    SMTPDelivery(settings).send(kind, payload, str(uuid4()))
    assert captured['options']['hostname'] == 'smtp.gmail.com'
    assert captured['options']['port'] == 587
    assert captured['options']['start_tls'] is True
    assert captured['options']['use_tls'] is False
    assert captured['options']['validate_certs'] is True
    assert captured['authenticated']
    assert captured['sender'] == 'noreply@rapidpacknship.com'
    expected = 'mark@rapidpacknship.com' if kind == 'contact' else 'customer@example.com'
    assert captured['recipients'] == [expected]
    message = captured['message']
    assert message['From'].addresses[0].display_name == 'RapidPacknShip'
    assert message['From'].addresses[0].addr_spec == 'noreply@rapidpacknship.com'
    assert str(message['To']) == expected
    assert str(message['Reply-To']) == ('customer@example.com' if kind == 'contact' else 'mark@rapidpacknship.com')
    assert message['Bcc'] is None and message['Cc'] is None


@pytest.mark.parametrize('value', ['Injected\r\nBcc: victim@example.com', 'bad\x00name', 'bad\x7fname'])
def test_display_name_rejects_controls(value):
    with pytest.raises(ValueError): Settings(mail_from_name=value)


def test_public_https_links_ignore_customer_origin(tmp_path):
    settings = Settings(ledger_path=str(tmp_path/'db'), public_origin='https://rapidpacknship.com',
                        subscriber_encryption_key=Fernet.generate_key().decode())
    store = NewsletterStore(Ledger(settings), settings)
    payload = store.prepare('customer@example.com', str(uuid4()))
    for action in ('confirm', 'unsubscribe'):
        assert payload[action+'_url'].startswith('https://rapidpacknship.com/api/website/newsletter/'+action+'#token=')
        assert 'customer@example.com' not in payload[action+'_url']

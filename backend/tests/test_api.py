import logging
from cryptography.fernet import Fernet
import asyncio
from uuid import uuid4
from concurrent.futures import ThreadPoolExecutor
import pytest
from fastapi.testclient import TestClient
from app.core.config import Settings
from app.main import create_app, SafeFormatter
from app.services.delivery import Unavailable, Uncertain, SMTPDelivery

CONTACT = dict(name='Tester', email='tester@example.com', subject='Question', message='PRIVATE_SENTINEL')
class Provider:
    calls = 0
    error = None
    def check(self): return True
    def send(self, *args):
        self.calls += 1
        if self.error: raise self.error('SECRET_SENTINEL')
@pytest.fixture
def setup(tmp_path):
    settings = Settings(ledger_path=str(tmp_path/'db'), rate_limit=100, subscriber_encryption_key=Fernet.generate_key().decode())
    provider = Provider()
    with TestClient(create_app(settings, provider)) as client:
        yield client, provider, settings

def post(client, body=None, key=None, kind='contact', **headers):
    return client.post('/api/website/'+kind, json=CONTACT if body is None else body, headers={'Idempotency-Key':key or str(uuid4()), **headers})

def test_replay_conflict_and_storage(setup):
    client, provider, settings = setup
    key = str(uuid4())
    first = post(client, key=key)
    assert first.status_code == 200
    assert post(client, key=key).json() == first.json()
    assert provider.calls == 1
    assert post(client, {**CONTACT, 'subject':'changed'}, key).status_code == 409
    assert post(client, dict(email='tester@example.com', consent=True), kind='newsletter').status_code == 200
    data = open(settings.ledger_path,'rb').read()
    assert b'PRIVATE_SENTINEL' not in data and b'tester@example.com' not in data

@pytest.mark.parametrize('change', [dict(email='bad'),dict(name=''),dict(message='x'*5001),dict(website='spam'),dict(customer_id=1)])
def test_invalid(setup, change):
    response = post(setup[0], {**CONTACT, **change})
    assert response.status_code == 422
    assert 'PRIVATE_SENTINEL' not in response.text
    assert setup[1].calls == 0

@pytest.mark.parametrize('body', [dict(email='bad',consent=True),dict(email='tester@example.com',consent=False),dict(email='tester@example.com'),dict(email='tester@example.com',consent=1)])
def test_newsletter_invalid(setup, body):
    assert post(setup[0],body,kind='newsletter').status_code == 422

@pytest.mark.parametrize('error', [Unavailable, Uncertain, RuntimeError])
def test_failure_redaction(setup,error,caplog):
    client, provider, _ = setup
    provider.error = error
    key = str(uuid4())
    with caplog.at_level(logging.INFO):
        response = post(client,key=key)
        assert post(client,key=key).status_code == 503
    assert response.status_code == 503
    assert provider.calls == (2 if error is Unavailable else 1)
    for private in ['PRIVATE_SENTINEL','SECRET_SENTINEL','tester@example.com']:
        assert private not in caplog.text+response.text

def test_disabled(tmp_path):
    with TestClient(create_app(Settings(ledger_path=str(tmp_path/'db')))) as client:
        assert post(client).status_code == 503
        assert client.get('/api/website/health').status_code == 503

def test_cors_protocol(setup):
    client,provider,_=setup
    headers={'Origin':'http://localhost:5173','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'Idempotency-Key, Content-Type'}
    response=client.options('/api/website/contact',headers=headers)
    assert response.status_code == 200
    assert response.headers['access-control-allow-origin'] == 'http://localhost:5173'
    assert post(client,Origin='https://evil.example').status_code == 403
    headers['Origin']='https://evil.example'
    assert client.options('/api/website/contact',headers=headers).status_code == 400
    assert client.post('/api/website/contact',content='secret').status_code == 415
    assert client.post('/api/website/contact',json=CONTACT).status_code == 400
    assert post(client,{**CONTACT,'message':'x'*17000}).status_code == 413
    assert provider.calls == 0

def test_limits_production(tmp_path):
    with TestClient(create_app(Settings(ledger_path=str(tmp_path/'db'),rate_limit=1),Provider())) as client:
        assert post(client).status_code == 200
        assert post(client).status_code == 429
    with pytest.raises(ValueError): Settings(environment='production')
    settings=Settings(environment='production',fingerprint_secret='x'*40,ledger_path=str(tmp_path/'prod'),allowed_origins=['https://rapidpacknship.com'], public_origin='https://rapidpacknship.com', subscriber_encryption_key=Fernet.generate_key().decode())
    with TestClient(create_app(settings,Provider())) as client:
        response=post(client,Origin='https://rapidpacknship.com')
        assert response.status_code == 200
        assert 'access-control-allow-origin' not in response.headers

def test_concurrent_claim(setup):
    ledger=setup[0].app.state.ledger
    key=str(uuid4())
    with ThreadPoolExecutor(max_workers=4) as pool:
        results=list(pool.map(lambda _: ledger.claim('contact',key,CONTACT,'client'),range(4)))
    assert sum(r[1][0]=='send' for r in results)==1

def test_log_and_smtp():
    record=logging.LogRecord('website',logging.ERROR,'',1,'PRIVATE_SENTINEL',(),None)
    assert 'PRIVATE_SENTINEL' not in SafeFormatter().format(record)
    with pytest.raises(ValueError): Settings(provider='smtp')

@pytest.mark.parametrize('phase,expected', [('connect',Unavailable),('login',Unavailable),('send',Uncertain),('quit',None),('ok',None)])
def test_smtp_delivery_phases(monkeypatch, phase, expected):
    closed = []
    class SMTP:
        def __init__(self,*args,**kwargs):
            assert kwargs['validate_certs'] is True
            assert kwargs['start_tls'] is True
        async def connect(self):
            if phase=='connect': raise OSError('SECRET_SENTINEL')
        async def login(self,*args):
            if phase=='login': raise OSError('SECRET_SENTINEL')
        async def sendmail(self,sender,recipients,message):
            assert recipients==['inbox@example.com']
            if phase=='send': raise TimeoutError('SECRET_SENTINEL')
            return {}, 'accepted'
        async def quit(self):
            if phase=='quit': raise OSError('SECRET_SENTINEL')
        def close(self): closed.append(True)
    monkeypatch.setattr('app.services.delivery.aiosmtplib.SMTP',SMTP)
    provider=SMTPDelivery(Settings(smtp_host='smtp.example.com',smtp_username='test',smtp_password='test-only',mail_from='sender@example.com',mail_to='inbox@example.com'))
    if expected:
        with pytest.raises(expected): provider.send('contact',CONTACT,str(uuid4()))
    else: provider.send('contact',CONTACT,str(uuid4()))
    assert closed


def test_global_limit_and_ledger_failure(setup):
    client,provider,settings=setup
    settings.global_limit=1
    assert post(client).status_code==200
    assert post(client).status_code==429
    settings.global_limit=100
    def broken(*args): raise OSError('SECRET_SENTINEL')
    client.app.state.ledger.finish=broken
    key=str(uuid4())
    response=post(client,key=key)
    assert response.status_code==503
    assert 'SECRET_SENTINEL' not in response.text
    calls=provider.calls
    assert post(client,key=key).status_code==503
    assert provider.calls==calls

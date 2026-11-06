import asyncio
import json
import time
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from cryptography.fernet import Fernet
from app.core.config import Settings
from app.core.requests import RequestGuard
from app.main import create_app
from app.services.delivery import SMTPDelivery, Uncertain, Unavailable
from test_api import Provider, CONTACT, post


def test_invalid_requests_consume_quota(tmp_path):
    settings=Settings(ledger_path=str(tmp_path/'db'),rate_limit=2)
    with TestClient(create_app(settings,Provider())) as client:
        assert post(client, {'email':'invalid'}).status_code==422
        assert client.post('/api/website/contact',content='{',headers={'Content-Type':'application/json'}).status_code==422
        assert post(client).status_code==429


def test_capacity_before_delivery(tmp_path):
    settings=Settings(ledger_path=str(tmp_path/'db'),max_inflight=1)
    provider=Provider()
    with TestClient(create_app(settings,provider)) as client:
        client.app.state.delivery_slots.acquire()
        response=post(client)
        assert response.status_code==503 and response.json()['retryable']
        assert provider.calls==0
        client.app.state.delivery_slots.release()
        assert post(client).status_code==200


@pytest.mark.parametrize('phase,exception', [('connect',Unavailable),('send',Uncertain),('quit',None)])
def test_total_smtp_deadline_closes_transport(monkeypatch,phase,exception):
    events=[]
    class SlowSMTP:
        def __init__(self,**kwargs): pass
        async def connect(self):
            if phase=='connect': await asyncio.sleep(5)
        async def login(self,*args): pass
        async def sendmail(self,*args):
            if phase=='send': await asyncio.sleep(5)
            return {}, 'ok'
        async def quit(self):
            if phase=='quit': await asyncio.sleep(5)
        def close(self): events.append('closed')
    monkeypatch.setattr('app.services.delivery.aiosmtplib.SMTP',SlowSMTP)
    settings=Settings(mail_from='sender@example.com',mail_to='inbox@example.com',delivery_timeout=.03)
    start=time.monotonic()
    if exception:
        with pytest.raises(exception): SMTPDelivery(settings).send('contact',CONTACT,str(uuid4()))
    else: SMTPDelivery(settings).send('contact',CONTACT,str(uuid4()))
    assert time.monotonic()-start < 1
    assert events==['closed']


def test_protocol_refusal_safe_retry(monkeypatch):
    from aiosmtplib.errors import SMTPDataError
    class SMTP:
        def __init__(self,**kwargs): pass
        async def connect(self): pass
        async def login(self,*args): pass
        async def sendmail(self,*args): raise SMTPDataError(451,'PRIVATE_SENTINEL')
        def close(self): pass
    monkeypatch.setattr('app.services.delivery.aiosmtplib.SMTP',SMTP)
    with pytest.raises(Unavailable):
        SMTPDelivery(Settings(mail_from='sender@example.com',mail_to='inbox@example.com')).send('contact',CONTACT,str(uuid4()))


def test_chunked_limit_and_slow_body():
    from types import SimpleNamespace
    class Ledger:
        def limit(self,*args): pass
    app=SimpleNamespace(state=SimpleNamespace(ledger=Ledger()))
    async def next_app(scope,receive,send): raise AssertionError('Oversized/slow body reached routing')
    async def run(slow):
        guard=RequestGuard(next_app,Settings(request_timeout=.01))
        events=[]
        async def receive():
            if slow: await asyncio.sleep(1)
            return {'type':'http.request','body':b'x'*17000,'more_body':False}
        async def send(event): events.append(event)
        await guard({'type':'http','method':'POST','path':'/api/website/contact','headers':[(b'content-type',b'application/json')],'app':app,'client':('test',1)},receive,send)
        return events[0]['status']
    assert asyncio.run(run(False))==413
    assert asyncio.run(run(True))==408


def test_storage_error_and_logs_do_not_leak(tmp_path):
    import logging
    import io
    from app.main import SafeFormatter
    stream=io.StringIO()
    handler=logging.StreamHandler(stream);handler.setFormatter(SafeFormatter())
    logging.getLogger('website').addHandler(handler)
    try:
        with TestClient(create_app(Settings(ledger_path=str(tmp_path/'db')),Provider())) as client:
            def broken(*args): raise RuntimeError('PRIVATE_SENTINEL secret@example.com')
            client.app.state.ledger.limit=broken
            response=post(client)
            assert response.status_code==503
            assert 'PRIVATE_SENTINEL' not in response.text+stream.getvalue()
            assert 'secret@example.com' not in response.text+stream.getvalue()
    finally:
        logging.getLogger('website').removeHandler(handler)


def test_settings_strict_transport_and_origin():
    for config in [{'smtp_tls':'none'},{'public_origin':'https://example.com/path'},{'allowed_origins':['*']},{'subscriber_encryption_key':'invalid'}]:
        with pytest.raises(ValueError): Settings(**config)


def test_control_characters_and_extra_token_fields(tmp_path):
    with TestClient(create_app(Settings(ledger_path=str(tmp_path/'db')),Provider())) as client:
        assert post(client,{**CONTACT,'name':'Injected\nHeader'}).status_code==422
        assert post(client,{**CONTACT,'message':'bad\x00text'}).status_code==422
        assert client.post('/api/website/newsletter/confirm',json={'token':'bad','customer_id':123}).status_code==422

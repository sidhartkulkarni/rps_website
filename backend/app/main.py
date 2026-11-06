import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import Settings
from app.core.security import Ledger
from app.routers import contact, newsletter
from app.services.delivery import DisabledDelivery, SMTPDelivery


class SafeFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({'level': record.levelname, 'event': getattr(record, 'event', 'website_event'), 'kind': getattr(record, 'kind', None), 'request_id': getattr(record, 'request_id', None)})


class BodyLimit:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http' or scope['method'] != 'POST':
            return await self.app(scope, receive, send)
        chunks = []
        size = 0
        while True:
            part = await receive()
            if part['type'] == 'http.disconnect':
                return
            size += len(part.get('body', b''))
            if size > 16384:
                return await JSONResponse({'detail': 'Request too large.'}, 413)(scope, receive, send)
            chunks.append(part.get('body', b''))
            if not part.get('more_body'):
                break
        async def buffered():
            return {'type': 'http.request', 'body': b''.join(chunks), 'more_body': False}
        await self.app(scope, buffered, send)


def create_app(settings=None, delivery=None):
    settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app):
        app.state.ledger = Ledger(settings)
        yield

    app = FastAPI(title='RPS Website API', lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
    app.state.delivery = delivery or (SMTPDelivery(settings) if settings.provider == 'smtp' else DisabledDelivery())
    app.add_middleware(BodyLimit)

    @app.middleware('http')
    async def guard(request: Request, call_next):
        if request.method == 'POST':
            origin = request.headers.get('origin')
            if origin and origin not in settings.allowed_origins:
                return JSONResponse({'detail': 'Origin not allowed.'}, 403)
            if request.headers.get('content-type', '').split(';')[0].strip() != 'application/json':
                return JSONResponse({'detail': 'JSON content required.'}, 415)
        response = await call_next(request)
        response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        return response

    app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins if settings.environment == 'development' else [], allow_methods=['POST', 'GET'], allow_headers=['Content-Type', 'Idempotency-Key'], allow_credentials=False)

    @app.exception_handler(RequestValidationError)
    async def validation_error(request, exc):
        # Never return pydantic input/context, which can contain private data.
        return JSONResponse({'detail': 'Check the required fields and email address.'}, 422)

    @app.get('/api/website/health')
    def health():
        return {'status': 'ok', 'delivery_configured': settings.provider != 'disabled'}

    app.include_router(contact.router, prefix='/api/website')
    app.include_router(newsletter.router, prefix='/api/website')
    return app


handler = logging.StreamHandler()
handler.setFormatter(SafeFormatter())
logging.getLogger('website').addHandler(handler)
logging.getLogger('website').setLevel(logging.INFO)
app = create_app()

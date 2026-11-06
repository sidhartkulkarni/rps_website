import json
import logging
import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import Settings
from app.core.errors import APIError
from app.core.requests import RequestGuard, error_response
from app.core.security import Ledger
from app.routers import contact, newsletter
from app.services.delivery import DisabledDelivery, SMTPDelivery
from app.services.newsletter import NewsletterStore
from app.services.health import Readiness


class SafeFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({'level': record.levelname, 'event': getattr(record, 'event', 'website_event'), 'kind': getattr(record, 'kind', None), 'request_id': getattr(record, 'request_id', None)})


def create_app(settings=None, delivery=None):
    settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app):
        app.state.ledger = Ledger(settings)
        app.state.newsletter = NewsletterStore(app.state.ledger, settings)
        app.state.readiness = Readiness(app.state.ledger, app.state.newsletter, app.state.delivery, settings)
        yield

    app = FastAPI(title='RPS Website API', lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
    app.state.delivery = delivery if delivery is not None else (SMTPDelivery(settings) if settings.provider == 'smtp' else DisabledDelivery())
    app.state.delivery_slots = threading.BoundedSemaphore(settings.max_inflight)
    app.add_middleware(RequestGuard, settings=settings)
    app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins if settings.environment == 'development' else [], allow_methods=['POST', 'GET'], allow_headers=['Content-Type', 'Idempotency-Key'], allow_credentials=False)

    @app.exception_handler(RequestValidationError)
    async def validation_error(request, exc):
        # Never echo Pydantic input/context or attacker-controlled field names.
        return error_response(APIError(422, 'validation_failed', 'Check the required fields and email address.'))

    @app.exception_handler(APIError)
    async def api_error(request, exc):
        return error_response(exc)

    @app.get('/api/website/health')
    def health():
        code, result = app.state.readiness.check()
        return JSONResponse(result, code)

    app.include_router(contact.router, prefix='/api/website')
    app.include_router(newsletter.router, prefix='/api/website')
    return app


logger = logging.getLogger('website')
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(SafeFormatter())
    logger.addHandler(handler)
logger.setLevel(logging.INFO)
logger.propagate = False
app = create_app()

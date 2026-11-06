import asyncio
from starlette.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from app.core.errors import APIError


def error_response(error):
    return JSONResponse({'detail': error.detail, 'code': error.code, 'retryable': error.retryable}, error.status_code, headers=error.headers)


class RequestGuard:
    """Bound untrusted input before JSON parsing, including malformed submissions."""
    def __init__(self, app, settings):
        self.app, self.settings = app, settings

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)
        response_started = False
        async def safe_send(message):
            nonlocal response_started
            if message['type'] == 'http.response.start':
                response_started = True
                message['headers'] = [(key, value) for key, value in message.get('headers', []) if key.lower() not in (b'cache-control', b'x-content-type-options', b'referrer-policy')] + [
                    (b'cache-control', b'no-store'), (b'x-content-type-options', b'nosniff'),
                    (b'referrer-policy', b'no-referrer')]
            await send(message)
        async def dispatch(receiver):
            try:
                await self.app(scope, receiver, safe_send)
            except Exception:
                # No exception traceback: database/provider details can contain private data.
                import logging
                logging.getLogger('website').error('request_failed', extra={'event': 'request_failed'})
                if not response_started:
                    await error_response(APIError(503, 'service_unavailable', 'Service unavailable. Please try later.', True))(scope, receive, safe_send)
        if scope['method'] != 'POST':
            return await dispatch(receive)
        headers = {key.lower(): value for key, value in scope['headers']}
        try:
            client = scope.get('client')
            await run_in_threadpool(scope['app'].state.ledger.limit, client[0] if client else 'unknown')
            origin = headers.get(b'origin', b'').decode('latin1')
            if (origin and origin not in self.settings.allowed_origins) or headers.get(b'sec-fetch-site') == b'cross-site':
                raise APIError(403, 'origin_denied', 'Origin not allowed.')
            if headers.get(b'content-type', b'').split(b';')[0].strip().lower() != b'application/json':
                raise APIError(415, 'json_required', 'JSON content required.')
            length = headers.get(b'content-length')
            if length is not None:
                try:
                    size = int(length)
                except ValueError:
                    raise APIError(400, 'invalid_request', 'Invalid request.') from None
                if size < 0:
                    raise APIError(400, 'invalid_request', 'Invalid request.')
                if size > 16384:
                    raise APIError(413, 'request_too_large', 'Request too large.')
            chunks, size = [], 0
            async with asyncio.timeout(self.settings.request_timeout):
                while True:
                    part = await receive()
                    if part['type'] == 'http.disconnect':
                        return
                    block = part.get('body', b'')
                    size += len(block)
                    if size > 16384:
                        raise APIError(413, 'request_too_large', 'Request too large.')
                    chunks.append(block)
                    if not part.get('more_body'):
                        break
            sent = False
            async def buffered():
                nonlocal sent
                if not sent:
                    sent = True
                    return {'type': 'http.request', 'body': b''.join(chunks), 'more_body': False}
                return await receive()
        except TimeoutError:
            return await error_response(APIError(408, 'request_timeout', 'Request timed out.', True))(scope, receive, safe_send)
        except APIError as error:
            return await error_response(error)(scope, receive, safe_send)
        except Exception:
            return await error_response(APIError(503, 'service_unavailable', 'Service unavailable. Please try later.', True))(scope, receive, safe_send)
        await dispatch(buffered)

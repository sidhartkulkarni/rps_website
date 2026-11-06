import logging
from uuid import UUID
from fastapi import Request
from app.core.errors import APIError
from app.services.delivery import Unavailable

logger = logging.getLogger('website.submissions')


def submit(kind, body, request: Request, idempotency_key: str):
    try:
        key = str(UUID(idempotency_key))
    except (ValueError, TypeError, AttributeError):
        raise APIError(400, 'invalid_key', 'A valid Idempotency-Key UUID is required.') from None
    state = request.app.state
    if not state.delivery_slots.acquire(blocking=False):
        raise APIError(503, 'busy', 'Service is busy. Please retry later with the same submission.', True, {'Retry-After': '30'})
    ledger = state.ledger
    try:
        digest, (action, request_id) = ledger.claim(kind, key, body.model_dump(mode='json'), '')
        if action == 'conflict':
            raise APIError(409, 'key_conflict', 'This submission key was used for different content.')
        if action == 'uncertain':
            raise APIError(503, 'delivery_uncertain', 'Delivery status is uncertain. Contact us directly; do not submit again.')
        if action == 'send':
            payload = body.model_dump(mode='json')
            if kind == 'newsletter':
                try:
                    payload = state.newsletter.prepare(payload['email'], request_id)
                except APIError:
                    ledger.finish(digest, 'failed')
                    raise
            try:
                state.delivery.send(kind, payload, request_id)
            except Unavailable:
                ledger.finish(digest, 'failed')
                raise APIError(503, 'delivery_unavailable', 'Delivery is unavailable. Please try later with the same submission.', True) from None
            except Exception:
                ledger.finish(digest, 'uncertain')
                raise APIError(503, 'delivery_uncertain', 'Delivery status is uncertain. Contact us directly; do not submit again.') from None
            ledger.finish(digest, 'sent')
        logger.info('submission_delivered', extra={'event': 'submission_delivered', 'kind': kind, 'request_id': request_id})
        return {'status': 'delivered', 'request_id': request_id,
                'message': 'Your inquiry was accepted by our email provider.' if kind == 'contact' else 'Check your email to confirm your newsletter subscription.'}
    except APIError as error:
        logger.info('submission_rejected', extra={'event': error.code, 'kind': kind})
        raise
    except Exception:
        logger.error('submission_unavailable', extra={'event': 'submission_unavailable', 'kind': kind})
        raise APIError(503, 'delivery_uncertain', 'Submission status could not be confirmed. Contact us before resubmitting.') from None
    finally:
        state.delivery_slots.release()

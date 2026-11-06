import logging
from uuid import UUID
from fastapi import HTTPException, Request
from app.services.delivery import Unavailable

logger = logging.getLogger('website.submissions')


def submit(kind, body, request: Request, idempotency_key: str):
    try:
        key = str(UUID(idempotency_key))
    except (ValueError, TypeError, AttributeError):
        raise HTTPException(400, 'A valid Idempotency-Key UUID is required.') from None
    ledger = request.app.state.ledger
    try:
        digest, (action, request_id) = ledger.claim(kind, key, body.model_dump(mode='json'), request.client.host if request.client else 'unknown')
        if action == 'conflict':
            raise HTTPException(409, 'This submission key was already used for different content.')
        if action == 'uncertain':
            raise HTTPException(503, 'Delivery status is uncertain. Contact us directly; do not submit again.')
        if action == 'send':
            try:
                request.app.state.delivery.send(kind, body.model_dump(mode='json'), request_id)
            except Unavailable:
                ledger.finish(digest, 'failed')
                raise HTTPException(503, 'Delivery is unavailable. Please try later or contact us directly.') from None
            except Exception:
                ledger.finish(digest, 'uncertain')
                raise HTTPException(503, 'Delivery status is uncertain. Contact us directly; do not submit again.') from None
            ledger.finish(digest, 'sent')
        logger.info('submission_delivered', extra={'event': 'submission_delivered', 'kind': kind, 'request_id': request_id})
        return {'status': 'delivered', 'request_id': request_id, 'message': 'Your inquiry was accepted by our email provider.' if kind == 'contact' else 'Your subscription request was sent. Enrollment requires confirmation.'}
    except HTTPException:
        raise
    except Exception:
        logger.error('submission_unavailable', extra={'event': 'submission_unavailable', 'kind': kind})
        raise HTTPException(503, 'Submission unavailable. If already attempted, contact us before resubmitting.') from None

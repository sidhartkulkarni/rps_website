from fastapi import APIRouter, Header, Request
from app.schemas.submissions import Newsletter, TokenAction
from app.services.submissions import submit
from app.services.newsletter_pages import landing

router = APIRouter()


@router.post('/newsletter')
def newsletter(body: Newsletter, request: Request, idempotency_key: str = Header(default='', max_length=64)):
    return submit('newsletter', body, request, idempotency_key)


@router.get('/newsletter/confirm', include_in_schema=False)
def confirm_page():
    return landing('confirm')


@router.get('/newsletter/unsubscribe', include_in_schema=False)
def unsubscribe_page():
    return landing('unsubscribe')


@router.post('/newsletter/confirm')
def confirm(body: TokenAction, request: Request):
    return request.app.state.newsletter.act('confirm', body.token)


@router.post('/newsletter/unsubscribe')
def unsubscribe(body: TokenAction, request: Request):
    return request.app.state.newsletter.act('unsubscribe', body.token)

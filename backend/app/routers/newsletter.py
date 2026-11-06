from fastapi import APIRouter, Header, Request
from app.schemas.submissions import Newsletter
from app.services.submissions import submit

router = APIRouter()

@router.post('/newsletter')
def newsletter(body: Newsletter, request: Request, idempotency_key: str = Header(default='', max_length=64)):
    return submit('newsletter', body, request, idempotency_key)

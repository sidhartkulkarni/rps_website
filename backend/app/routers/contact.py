from fastapi import APIRouter, Header, Request
from app.schemas.submissions import Contact
from app.services.submissions import submit

router = APIRouter()

@router.post('/contact')
def contact(body: Contact, request: Request, idempotency_key: str = Header(default='', max_length=64)):
    return submit('contact', body, request, idempotency_key)

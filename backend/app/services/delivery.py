import smtplib
import ssl
from email.message import EmailMessage
from typing import Protocol
from app.core.config import Settings


class Unavailable(Exception):
    pass


class Uncertain(Exception):
    pass


class Delivery(Protocol):
    def send(self, kind: str, payload: dict, request_id: str) -> None: ...


class DisabledDelivery:
    def send(self, kind, payload, request_id):
        raise Unavailable()


class SMTPDelivery:
    def __init__(self, settings: Settings):
        self.settings = settings

    def send(self, kind, payload, request_id):
        s = self.settings
        if not all((s.smtp_host, s.smtp_username, s.smtp_password.get_secret_value(), s.mail_from, s.mail_to)):
            raise Unavailable()
        message = EmailMessage()
        message['From'] = s.mail_from
        message['To'] = s.mail_to
        message['Subject'] = 'Website contact inquiry' if kind == 'contact' else 'Website newsletter subscription request'
        message['Message-ID'] = f'<{request_id}@website.rapidpacknship.com>'
        message.set_content('\n'.join(f'{key}: {value}' for key, value in payload.items() if key != 'website'))
        submitting = False
        accepted = False
        try:
            with smtplib.SMTP(s.smtp_host, s.smtp_port, timeout=15) as smtp:
                smtp.ehlo()
                smtp.starttls(context=ssl.create_default_context())
                smtp.ehlo()
                smtp.login(s.smtp_username, s.smtp_password.get_secret_value())
                submitting = True
                smtp.send_message(message)
                # QUIT failure after acceptance must not trigger a resend.
                accepted = True
                submitting = False
        except Exception:
            if accepted:
                return
            if submitting:
                raise Uncertain() from None
            raise Unavailable() from None

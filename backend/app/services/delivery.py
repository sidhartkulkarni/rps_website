"""TLS SMTP with a true total async deadline; no queued/background delivery."""
import asyncio
from email.message import EmailMessage
from email.headerregistry import Address
from email.policy import SMTP as SMTP_POLICY
from typing import Protocol
import aiosmtplib
from aiosmtplib.errors import SMTPRecipientsRefused, SMTPResponseException
from app.core.config import Settings


class Unavailable(Exception):
    """Provider definitively did not accept this message; same-key retry is safe."""


class Uncertain(Exception):
    """Acceptance unknown; do not resend automatically."""


class Delivery(Protocol):
    def send(self, kind: str, payload: dict, request_id: str) -> None: ...
    def check(self) -> bool: ...


class DisabledDelivery:
    def send(self, kind, payload, request_id):
        raise Unavailable()

    def check(self):
        return False


class SMTPDelivery:
    def __init__(self, settings: Settings):
        self.settings = settings

    def send(self, kind, payload, request_id):
        s = self.settings
        message = EmailMessage(policy=SMTP_POLICY)
        message['From'] = Address(display_name=s.mail_from_name, addr_spec=str(s.mail_from))
        recipient = str(s.mail_to) if kind == 'contact' else payload['email']
        message['To'] = recipient
        message['Message-ID'] = f'<{request_id}@{str(s.mail_from).split("@")[-1]}>'
        if kind == 'contact':
            message['Subject'] = 'Website contact inquiry'
            message['Reply-To'] = payload['email']
            body = '\n'.join(f'{key}: {payload[key]}' for key in ('name', 'email', 'subject', 'message'))
        else:
            message['Reply-To'] = str(s.mail_reply_to or s.mail_to)
            message['Subject'] = 'Confirm your Rapid Pack N Ship newsletter subscription'
            body = ('You requested Rapid Pack N Ship newsletter emails.\n\n'
                    f'Confirm your subscription (pending links expire after {s.confirmation_ttl / 3600:g} hours):\n'
                    f'{payload["confirm_url"]}\n\n'
                    'If you did not request this, ignore this email. You will not be subscribed without confirmation.\n'
                    f'Cancel this request or unsubscribe:\n{payload["unsubscribe_url"]}\n')
        message.set_content(body, cte='base64')
        self._run(self._exchange(message, recipient))

    def check(self):
        try:
            self._run(self._exchange())
            return True
        except Exception:
            return False

    @staticmethod
    def _run(coroutine):
        # Do not wait for an OS resolver executor after the SMTP deadline.
        # A lingering resolver cannot submit mail after transport cancellation.
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(coroutine)
        finally:
            loop.close()

    async def _exchange(self, message=None, recipient=None):
        s = self.settings
        client = aiosmtplib.SMTP(hostname=s.smtp_host, port=s.smtp_port,
                                use_tls=s.smtp_tls == 'tls', start_tls=s.smtp_tls == 'starttls',
                                validate_certs=True, timeout=s.smtp_timeout)
        submitting = False
        accepted = False
        try:
            async with asyncio.timeout(s.delivery_timeout if message else s.health_timeout):
                await client.connect()
                await client.login(s.smtp_username, s.smtp_password.get_secret_value())
                if message is None:
                    await client.noop()
                else:
                    # One recipient only. Explicit refusals are safe retries; connection loss is not.
                    submitting = True
                    refused, _ = await client.sendmail(str(s.mail_from), [recipient], message.as_bytes())
                    if refused:
                        raise Unavailable()
                    accepted = True
                await client.quit()
        except (SMTPRecipientsRefused, SMTPResponseException, Unavailable):
            if not accepted:
                raise Unavailable() from None
        except Exception:
            if not accepted:
                if submitting:
                    raise Uncertain() from None
                raise Unavailable() from None
        finally:
            # Synchronous transport close also runs on cancellation/deadline. No worker keeps sending.
            client.close()

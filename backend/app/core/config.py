from pathlib import Path
from urllib.parse import urlsplit
from cryptography.fernet import Fernet
from pydantic import EmailStr, Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix='WEBSITE_', extra='ignore', hide_input_in_errors=True)
    environment: str = 'development'
    allowed_origins: list[str] = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8001', 'http://127.0.0.1:8001']
    provider: str = 'disabled'
    ledger_path: str = '/tmp/rps-website-delivery.sqlite3'
    fingerprint_secret: SecretStr = SecretStr('local-development-only-change-before-production')
    subscriber_encryption_key: SecretStr = SecretStr('')
    public_origin: str = 'http://localhost:8001'
    smtp_host: str = ''
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_tls: str = 'starttls'
    smtp_username: str = ''
    smtp_password: SecretStr = SecretStr('')
    mail_from: EmailStr | None = None
    mail_to: EmailStr | None = None
    mail_from_name: str = Field(default="RapidPacknShip", min_length=1, max_length=100)
    mail_reply_to: EmailStr | None = None
    smtp_timeout: float = Field(default=8, gt=0, le=15)
    delivery_timeout: float = Field(default=20, gt=0, le=30)
    health_timeout: float = Field(default=8, gt=0, le=15)
    health_cache_seconds: float = Field(default=30, ge=1, le=300)
    max_inflight: int = Field(default=2, ge=1, le=8)
    request_timeout: float = Field(default=10, gt=0, le=15)
    rate_limit: int = Field(default=5, ge=1, le=1000)
    rate_window: int = Field(default=600, ge=1, le=86400)
    global_limit: int = Field(default=100, ge=1, le=10000)
    newsletter_cooldown: int = Field(default=900, ge=1, le=86400)
    newsletter_daily_limit: int = Field(default=3, ge=1, le=10)
    confirmation_ttl: int = Field(default=172800, ge=60, le=604800)
    subscriber_retention_days: int = Field(default=30, ge=7, le=90)

    @model_validator(mode='after')
    def validate_config(self):
        if self.provider not in ('disabled', 'smtp') or self.environment not in ('development', 'production'):
            raise ValueError('Unsupported provider/environment')
        if self.smtp_tls not in ('starttls', 'tls'):
            raise ValueError('Verified TLS is required')
        for origin in [*self.allowed_origins, self.public_origin]:
            url = urlsplit(origin)
            if url.scheme not in ('http', 'https') or not url.hostname or url.username or url.password or url.path or url.query or url.fragment:
                raise ValueError('Explicit origins without credentials or paths required')
            if self.environment == 'production' and url.scheme != 'https':
                raise ValueError('Production origins must use HTTPS')
        if self.subscriber_encryption_key.get_secret_value():
            try:
                Fernet(self.subscriber_encryption_key.get_secret_value().encode())
            except Exception:
                raise ValueError('Invalid subscriber encryption key') from None
        if any(ord(char) < 32 or ord(char) == 127 for char in self.mail_from_name):
            raise ValueError('Invalid sender display name')
        if self.mail_reply_to and not str(self.mail_reply_to).isascii():
            raise ValueError('ASCII reply mailbox required')
        if self.provider == 'smtp':
            if not all((self.smtp_host, self.smtp_username, self.smtp_password.get_secret_value(), self.mail_from, self.mail_to)):
                raise ValueError('Complete SMTP configuration required')
            if any(ord(char) < 33 for char in self.smtp_host) or '/' in self.smtp_host:
                raise ValueError('Invalid SMTP host')
            if not str(self.mail_from).isascii() or not str(self.mail_to).isascii():
                raise ValueError('ASCII SMTP mailboxes required')
        if self.environment == 'production':
            if len(self.fingerprint_secret.get_secret_value()) < 32 or self.fingerprint_secret.get_secret_value().startswith('local-development'):
                raise ValueError('Production fingerprint secret required')
            path = Path(self.ledger_path)
            repository = Path(__file__).resolve().parents[3]
            if not path.is_absolute() or path.is_relative_to('/tmp') or path.is_relative_to('/var/tmp') or path.resolve().is_relative_to(repository):
                raise ValueError('Production requires external persistent storage')
            if not self.subscriber_encryption_key.get_secret_value():
                raise ValueError('Production subscriber encryption key required')
            if self.public_origin not in self.allowed_origins:
                raise ValueError('Public origin must be explicitly allowed')
        return self

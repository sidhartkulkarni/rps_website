from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix='WEBSITE_', extra='ignore')
    environment: str = 'development'
    allowed_origins: list[str] = ['http://localhost:5173', 'http://127.0.0.1:5173']
    provider: str = 'disabled'
    ledger_path: str = '/tmp/rps-website-delivery.sqlite3'
    fingerprint_secret: SecretStr = SecretStr('local-development-only-change-before-production')
    smtp_host: str = ''
    smtp_port: int = 587
    smtp_username: str = ''
    smtp_password: SecretStr = SecretStr('')
    mail_from: str = ''
    mail_to: str = ''
    rate_limit: int = 5
    rate_window: int = 600
    global_limit: int = 100

    @model_validator(mode='after')
    def validate_config(self):
        if self.provider not in ('disabled', 'smtp'):
            raise ValueError('Unsupported delivery provider')
        if self.environment not in ('development', 'production'):
            raise ValueError('Unsupported environment')
        if any(origin == '*' or not origin.startswith(('http://', 'https://')) for origin in self.allowed_origins):
            raise ValueError('Explicit origins required')
        if self.rate_limit < 1 or self.rate_window < 1 or self.global_limit < 1:
            raise ValueError('Positive rate limits required')
        if self.environment == 'production':
            if len(self.fingerprint_secret.get_secret_value()) < 32 or self.fingerprint_secret.get_secret_value().startswith('local-development'):
                raise ValueError('Production fingerprint secret required')
            if not self.ledger_path.startswith('/') or self.ledger_path.startswith('/tmp/'):
                raise ValueError('Production requires an external persistent ledger path')
            if any(not origin.startswith('https://') for origin in self.allowed_origins):
                raise ValueError('Production origins must use HTTPS')
        return self

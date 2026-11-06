from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class Submission(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True, hide_input_in_errors=True)
    email: EmailStr = Field(max_length=254)
    website: str = Field(default='', max_length=0)  # Honeypot; never pretend delivery.

    @field_validator('email')
    @classmethod
    def smtp_address(cls, value):
        local, domain = str(value).rsplit('@', 1)
        if not local.isascii():
            raise ValueError('SMTPUTF8 mailboxes are not supported')
        return local + '@' + domain.encode('idna').decode('ascii')


class Contact(Submission):
    name: str = Field(min_length=1, max_length=100)
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5000)

    @field_validator('name', 'subject', 'message')
    @classmethod
    def safe_text(cls, value, info):
        allowed = '\n\r\t' if info.field_name == 'message' else ''
        if any((ord(char) < 32 and char not in allowed) or ord(char) == 127 for char in value):
            raise ValueError('Control characters are not supported')
        return value


class Newsletter(Submission):
    consent: Literal[True]

    @field_validator('consent', mode='before')
    @classmethod
    def explicit_consent(cls, value):
        if value is not True:
            raise ValueError('Explicit consent required')
        return value


class TokenAction(BaseModel):
    model_config = ConfigDict(extra='forbid', hide_input_in_errors=True)
    token: str = Field(min_length=40, max_length=160, pattern=r'^[a-z]+\.[a-f0-9]{32}\.[a-f0-9]{64}$')

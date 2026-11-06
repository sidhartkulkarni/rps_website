from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class Submission(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    email: EmailStr = Field(max_length=254)
    website: str = Field(default='', max_length=0)  # Honeypot; never pretend delivery.


class Contact(Submission):
    name: str = Field(min_length=1, max_length=100)
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5000)


class Newsletter(Submission):
    consent: Literal[True]

    @field_validator('consent', mode='before')
    @classmethod
    def explicit_consent(cls, value):
        if value is not True:
            raise ValueError('Explicit consent required')
        return value

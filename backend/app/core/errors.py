from fastapi import HTTPException


class APIError(HTTPException):
    def __init__(self, status, code, detail, retryable=False, headers=None):
        super().__init__(status, detail, headers)
        self.code = code
        self.retryable = retryable

import typing

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.auth import get_jwks
from app.core.errors import Unauthorized

bearer = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token, key=get_jwks(), algorithms=["ES256"], audience="authenticated"
        )
        user_id = payload["sub"]
        return typing.cast(str, user_id)
    except JWTError:
        raise Unauthorized().to_http_exception()

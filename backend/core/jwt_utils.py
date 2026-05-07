import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings


def generate_access_token(user) -> str:
    payload = {
        'user_id': str(user.id),
        'username': user.username,
        'name': user.name,
        'nickname': user.nickname,
        'role': getattr(user, 'role', 'USER'),
        'type': 'access',
        'iat': datetime.now(tz=timezone.utc),
        'exp': datetime.now(tz=timezone.utc) + timedelta(seconds=settings.ACCESS_TOKEN_EXPIRY),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm='HS256')


def generate_refresh_token(user) -> str:
    payload = {
        'user_id': str(user.id),
        'username': user.username,
        'name': user.name,
        'nickname': user.nickname,
        'role': getattr(user, 'role', 'USER'),
        'type': 'refresh',
        'iat': datetime.now(tz=timezone.utc),
        'exp': datetime.now(tz=timezone.utc) + timedelta(seconds=settings.REFRESH_TOKEN_EXPIRY),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm='HS256')


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])

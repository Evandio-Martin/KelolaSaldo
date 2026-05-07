import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ', 1)[1].strip()
        
        # Check if token is blacklisted
        from users.models import BlacklistedToken
        if BlacklistedToken.objects.filter(token=token).exists():
            raise AuthenticationFailed('Token telah di-logout.')
        
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token telah kadaluarsa.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Token tidak valid.')

        if payload.get('type') != 'access':
            raise AuthenticationFailed('Tipe token tidak valid. Gunakan access token.')

        from users.models import User
        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            raise AuthenticationFailed('User tidak ditemukan.')

        return (user, token)

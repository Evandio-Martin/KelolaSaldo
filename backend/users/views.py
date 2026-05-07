import jwt

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth import authenticate
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample

from core.response import api_response
from core.jwt_utils import generate_access_token, generate_refresh_token, decode_token
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import User, BlacklistedToken


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        summary='Register new user',
        description='Create a new user account with name, username, password, and optional nickname',
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(
                response=UserSerializer,
                description='User registered successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'success': True,
                            'statusCode': 201,
                            'message': 'Registrasi berhasil.',
                            'data': {
                                'id': '123e4567-e89b-12d3-a456-426614174000',
                                'name': 'John Doe',
                                'nickname': 'Johnny',
                                'username': 'johndoe',
                                'created_at': '2026-04-05T14:36:00Z',
                                'updated_at': '2026-04-05T14:36:00Z'
                            }
                        }
                    )
                ]
            ),
            400: OpenApiResponse(description='Validation error or invalid credentials')
        },
        tags=['Authentication']
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=serializer.errors,
            )
        user = serializer.save()
        return api_response(
            success=True,
            status_code=status.HTTP_201_CREATED,
            message='Registrasi berhasil.',
            data=UserSerializer(user).data,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        summary='User login',
        description='Authenticate user with username and password, returns access and refresh tokens',
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(
                description='Login successful',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'success': True,
                            'statusCode': 200,
                            'message': 'Login berhasil.',
                            'data': {
                                'access_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                'refresh_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                            }
                        }
                    )
                ]
            ),
            400: OpenApiResponse(description='Invalid credentials or validation error')
        },
        tags=['Authentication']
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=serializer.errors,
            )

        user = authenticate(
            request,
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password'],
        )

        if user is None:
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Username atau password salah.',
            )

        access_token = generate_access_token(user)
        refresh_token = generate_refresh_token(user)

        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Login berhasil.',
            data={
                'access_token': access_token,
                'refresh_token': refresh_token,
            },
        )


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        summary='Refresh access token',
        description='Generate a new access token using a valid refresh token. The refresh token remains unchanged.',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'refresh_token': {'type': 'string', 'description': 'Valid refresh token'}
                },
                'required': ['refresh_token']
            }
        },
        responses={
            200: OpenApiResponse(
                description='Token refreshed successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'success': True,
                            'statusCode': 200,
                            'message': 'Token berhasil diperbarui.',
                            'data': {
                                'access_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                            }
                        }
                    )
                ]
            ),
            401: OpenApiResponse(description='Invalid or expired refresh token')
        },
        tags=['Authentication']
    )
    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='refresh_token wajib diisi.',
            )

        try:
            payload = decode_token(refresh_token)
        except jwt.ExpiredSignatureError:
            return api_response(
                success=False,
                status_code=status.HTTP_401_UNAUTHORIZED,
                message='Refresh token telah kadaluarsa. Silakan login kembali.',
            )
        except jwt.InvalidTokenError:
            return api_response(
                success=False,
                status_code=status.HTTP_401_UNAUTHORIZED,
                message='Refresh token tidak valid.',
            )

        if payload.get('type') != 'refresh':
            return api_response(
                success=False,
                status_code=status.HTTP_401_UNAUTHORIZED,
                message='Tipe token tidak valid. Gunakan refresh token.',
            )

        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            return api_response(
                success=False,
                status_code=status.HTTP_404_NOT_FOUND,
                message='User tidak ditemukan.',
            )

        new_access_token = generate_access_token(user)

        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Token berhasil diperbarui.',
            data={
                'access_token': new_access_token,
            },
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Logout user',
        description='Logout user by blacklisting access and refresh tokens (requires Bearer token)',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'refresh_token': {'type': 'string', 'description': 'Refresh token to blacklist'}
                },
                'required': ['refresh_token']
            }
        },
        responses={
            200: OpenApiResponse(
                description='Logout successful',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'success': True,
                            'statusCode': 200,
                            'message': 'Logout berhasil.',
                            'data': None
                        }
                    )
                ]
            ),
            401: OpenApiResponse(description='Unauthorized - Invalid or missing token')
        },
        tags=['Authentication']
    )
    def post(self, request):
        # Get access token from request (already authenticated)
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            access_token = auth_header.split(' ', 1)[1].strip()
            # Blacklist access token
            BlacklistedToken.objects.get_or_create(token=access_token)
        
        # Get and blacklist refresh token
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            BlacklistedToken.objects.get_or_create(token=refresh_token)
        
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Logout berhasil.',
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Get current user',
        description='Get authenticated user information (requires Bearer token)',
        responses={
            200: OpenApiResponse(
                response=UserSerializer,
                description='User data retrieved successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'success': True,
                            'statusCode': 200,
                            'message': 'Data user berhasil diambil.',
                            'data': {
                                'id': '123e4567-e89b-12d3-a456-426614174000',
                                'name': 'John Doe',
                                'nickname': 'Johnny',
                                'username': 'johndoe',
                                'created_at': '2026-04-05T14:36:00Z',
                                'updated_at': '2026-04-05T14:36:00Z'
                            }
                        }
                    )
                ]
            ),
            401: OpenApiResponse(description='Unauthorized - Invalid or missing token')
        },
        tags=['User']
    )
    def get(self, request):
        return api_response(
            success=True,
            status_code=status.HTTP_200_OK,
            message='Data user berhasil diambil.',
            data=UserSerializer(request.user).data,
        )

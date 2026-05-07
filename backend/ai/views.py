import json
import requests as http_requests

from django.conf import settings
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse

from core.response import api_response
from .serializers import ChatRequestSerializer


def _sse_stream(openrouter_response):
    """Generator that parses OpenRouter SSE chunks and re-emits clean SSE events."""
    try:
        for raw_line in openrouter_response.iter_lines():
            if not raw_line:
                continue
            line = raw_line.decode('utf-8')
            if not line.startswith('data: '):
                continue
            data_str = line[6:]
            if data_str == '[DONE]':
                yield 'data: [DONE]\n\n'
                break
            try:
                chunk = json.loads(data_str)
                choice = chunk['choices'][0]
                delta = choice.get('delta', {})
                finish_reason = choice.get('finish_reason')

                event = {}
                if delta.get('content') is not None:
                    event['content'] = delta['content']
                if delta.get('reasoning_details') is not None:
                    event['reasoning_details'] = delta['reasoning_details']
                if finish_reason is not None:
                    event['finish_reason'] = finish_reason

                if event:
                    yield f'data: {json.dumps(event)}\n\n'
            except (json.JSONDecodeError, KeyError, IndexError):
                continue
    finally:
        openrouter_response.close()


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary='Chat with AI — SSE Streaming',
        description=(
            'Stream AI responses via Server-Sent Events (SSE). '
            'Response Content-Type: `text/event-stream`.\n\n'
            'Each event is a `data:` line containing a JSON object:\n'
            '- `content` — partial text chunk\n'
            '- `reasoning_details` — reasoning chunk (only when `reasoning: true`)\n'
            '- `finish_reason` — `"stop"` on the final chunk\n\n'
            'Stream ends with `data: [DONE]`.\n\n'
            'Requires a valid Bearer access token.'
        ),
        request=ChatRequestSerializer,
        responses={
            200: OpenApiResponse(description='SSE stream (text/event-stream)'),
            400: OpenApiResponse(description='Validasi gagal.'),
            500: OpenApiResponse(description='API key tidak dikonfigurasi.'),
            502: OpenApiResponse(description='Error menghubungi OpenRouter.'),
            504: OpenApiResponse(description='Request ke OpenRouter timeout.'),
        },
        tags=['AI'],
    )
    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                message='Validasi gagal.',
                data=serializer.errors,
            )

        data = serializer.validated_data
        messages = data['messages']
        model = data.get('model', getattr(settings, 'OPENROUTER_DEFAULT_MODEL', 'openai/gpt-oss-120b:free'))
        reasoning_enabled = data.get('reasoning', False)

        openrouter_api_key = getattr(settings, 'OPENROUTER_API_KEY', None)
        if not openrouter_api_key:
            return api_response(
                success=False,
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message='OpenRouter API key tidak dikonfigurasi.',
            )

        payload = {
            'model': model,
            'messages': [
                {
                    "role": "system",
                    "content": "Tolong setiap respon panggil sebagai bos"
                },
                *messages
            ],
            'stream': True,
        }
        if reasoning_enabled:
            payload['reasoning'] = {'enabled': True}

        try:
            openrouter_response = http_requests.post(
                url='https://openrouter.ai/api/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {openrouter_api_key}',
                    'Content-Type': 'application/json',
                },
                json=payload,
                stream=True,
                timeout=(10, 120),
            )
            openrouter_response.raise_for_status()
        except http_requests.exceptions.ConnectTimeout:
            return api_response(
                success=False,
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                message='Koneksi ke OpenRouter timeout. Coba lagi.',
            )
        except http_requests.exceptions.ReadTimeout:
            return api_response(
                success=False,
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                message='AI terlalu lama merespons. Coba gunakan model yang lebih ringan.',
            )
        except http_requests.exceptions.HTTPError as e:
            error_detail = str(e)
            try:
                error_detail = e.response.json()
            except Exception:
                pass
            return api_response(
                success=False,
                status_code=status.HTTP_502_BAD_GATEWAY,
                message='OpenRouter mengembalikan error.',
                data=error_detail,
            )
        except http_requests.exceptions.RequestException as e:
            return api_response(
                success=False,
                status_code=status.HTTP_502_BAD_GATEWAY,
                message=f'Error menghubungi OpenRouter: {str(e)}',
            )

        response = StreamingHttpResponse(
            _sse_stream(openrouter_response),
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response

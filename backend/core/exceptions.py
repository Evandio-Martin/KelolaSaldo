from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        status_code = response.status_code
        detail = response.data
        
        # Force 401 for authentication errors instead of 403
        if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
            status_code = status.HTTP_401_UNAUTHORIZED

        if isinstance(detail, dict):
            if 'detail' in detail and len(detail) == 1:
                message = str(detail['detail'])
            else:
                messages = []
                for key, value in detail.items():
                    if isinstance(value, list):
                        messages.append(f"{key}: {', '.join(str(v) for v in value)}")
                    else:
                        messages.append(f"{key}: {str(value)}")
                message = '; '.join(messages)
        elif isinstance(detail, list):
            message = ', '.join(str(v) for v in detail)
        else:
            message = str(detail)

        response.data = {
            "success": False,
            "statusCode": status_code,
            "message": message,
            "data": None,
        }
        response.status_code = status_code

    return response

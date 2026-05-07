from rest_framework.response import Response


def api_response(
    success: bool,
    status_code: int,
    message: str,
    data=None,
    metadata: dict = None,
):
    body = {
        "success": success,
        "statusCode": status_code,
        "message": message,
        "data": data if data is not None else [],
    }
    if metadata is not None:
        body["metadata"] = metadata
    return Response(body, status=status_code)


def paginated_response(
    message: str,
    data,
    page: int,
    limit: int,
    total_items: int,
    status_code: int = 200,
):
    import math
    total_pages = math.ceil(total_items / limit) if limit > 0 else 1
    return api_response(
        success=True,
        status_code=status_code,
        message=message,
        data=data,
        metadata={
            "limit": limit,
            "page": page,
            "totalItems": total_items,
            "totalPages": total_pages,
        },
    )

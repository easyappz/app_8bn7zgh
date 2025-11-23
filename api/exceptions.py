from typing import Any, Dict

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc: Exception, context: Dict[str, Any]) -> Response | None:
    """Wrap DRF errors to match the ErrorResponse schema.

    * For 400 responses, convert field errors into ``field_errors`` where each
      value is a single string rather than a list.
    * Keep other responses mostly as-is, but adjust some default English
      messages to Russian texts where appropriate.
    """

    response = drf_exception_handler(exc, context)
    if response is None:
        return None

    # Normalize default English auth/permission messages into Russian.
    if response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN):
        if isinstance(response.data, dict) and "detail" in response.data:
            detail = str(response.data["detail"])
            if detail == "Authentication credentials were not provided.":
                response.data["detail"] = "Пользователь не авторизован."
            elif detail == "Invalid token.":
                response.data["detail"] = "Недействительный токен."

        return response

    # For 400 responses, convert field errors into the ErrorResponse shape.
    if response.status_code == status.HTTP_400_BAD_REQUEST and isinstance(response.data, dict):
        data = response.data
        detail: str | None = None
        field_errors: Dict[str, str] = {}

        # Extract main detail message if present.
        if "detail" in data:
            raw_detail = data.get("detail")
            if isinstance(raw_detail, (list, tuple)) and raw_detail:
                detail = str(raw_detail[0])
            else:
                detail = str(raw_detail)

        # Map validation errors per field.
        non_field = data.get("non_field_errors")
        if non_field and not detail:
            if isinstance(non_field, (list, tuple)) and non_field:
                detail = str(non_field[0])
            else:
                detail = str(non_field)

        for key, value in data.items():
            if key in {"detail", "non_field_errors"}:
                continue
            if isinstance(value, (list, tuple)) and value:
                field_errors[key] = str(value[0])
            else:
                field_errors[key] = str(value)

        body: Dict[str, Any] = {}
        if detail:
            body["detail"] = detail
        if field_errors:
            body["field_errors"] = field_errors

        response.data = body

    return response

from typing import Optional, Tuple

from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from .models import AuthToken, Member


class MemberTokenAuthentication(BaseAuthentication):
    """Custom authentication based on AuthToken model.

    Reads the Authorization header in the form ``Token <token>`` and
    authenticates the associated Member.
    """

    keyword = "Token"

    def authenticate(self, request) -> Optional[Tuple[Member, AuthToken]]:
        raw_header = get_authorization_header(request)
        if not raw_header:
            # No credentials provided; let DRF treat the user as anonymous.
            return None

        try:
            auth_header = raw_header.decode("utf-8").strip()
        except UnicodeError:
            raise AuthenticationFailed("Неверная кодировка заголовка Authorization.")

        if not auth_header:
            return None

        parts = auth_header.split(" ")
        if len(parts) != 2 or parts[0] != self.keyword:
            raise AuthenticationFailed(
                "Неверный формат заголовка Authorization. Ожидается 'Token <токен>'.",
            )

        key = parts[1].strip()
        if not key:
            raise AuthenticationFailed("Токен аутентификации не предоставлен.")

        try:
            token = AuthToken.objects.select_related("member").get(key=key)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed("Недействительный токен.")

        member = token.member
        return member, token

    def authenticate_header(self, request) -> str:
        """Return authentication header value for 401 responses."""

        return self.keyword

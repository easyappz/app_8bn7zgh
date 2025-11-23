from django.db import models

import secrets


class Member(models.Model):
    """Application-level user model.

    Does not use or reference Django's built-in User model.
    """

    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:  # pragma: no cover - representation helper
        return self.username


def generate_token() -> str:
    """Generate a secure random token string.

    Uses the standard library ``secrets`` module for cryptographic randomness.
    """

    return secrets.token_hex(32)


class AuthToken(models.Model):
    """Token used for authenticating a Member via Authorization header."""

    key = models.CharField(max_length=64, unique=True, db_index=True, default=generate_token)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="auth_tokens")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - representation helper
        return f"Token for member {self.member_id}"


class ChatMessage(models.Model):
    """Single message in the global group chat."""

    author = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="messages")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self) -> str:  # pragma: no cover - representation helper
        return f"{self.author_id}: {self.text[:20]}"

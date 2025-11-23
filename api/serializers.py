from django.contrib.auth.hashers import check_password, make_password
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

from .models import AuthToken, ChatMessage, Member


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Member model.

    Exposes id, username, created_at.
    Password is write-only and used for registration/update flows.
    """

    password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = Member
        fields = ("id", "username", "password", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_username(self, value: str) -> str:
        queryset = Member.objects.all()
        instance = getattr(self, "instance", None)
        if instance is not None:
            queryset = queryset.exclude(pk=instance.pk)
        if queryset.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "Пароль обязателен."})
        validated_data["password"] = make_password(password)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        if password:
            instance.password = make_password(password)
        username = validated_data.get("username")
        if username is not None:
            instance.username = username
        instance.save(update_fields=["username", "password", "created_at"]) if False else instance.save()
        return instance


class RegistrationSerializer(serializers.Serializer):
    """Serializer used for user registration."""

    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, value: str) -> str:
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует.")
        return value

    def create(self, validated_data):
        username = validated_data["username"]
        password = validated_data["password"]
        member = Member(username=username, password=make_password(password))
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    """Serializer used for login with username and password."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if not username or not password:
            raise serializers.ValidationError("Необходимо указать имя пользователя и пароль.")

        try:
            member = Member.objects.get(username=username)
        except Member.DoesNotExist:
            raise AuthenticationFailed("Неверное имя пользователя или пароль.")

        if not check_password(password, member.password):
            raise AuthenticationFailed("Неверное имя пользователя или пароль.")

        attrs["member"] = member
        return attrs


class MemberBriefSerializer(serializers.ModelSerializer):
    """Short representation of Member for nested usage (e.g. in chat messages)."""

    class Meta:
        model = Member
        fields = ("id", "username")


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages with nested author information."""

    author = MemberBriefSerializer(read_only=True)
    text = serializers.CharField(max_length=1000)

    class Meta:
        model = ChatMessage
        fields = ("id", "author", "text", "created_at")
        read_only_fields = ("id", "author", "created_at")


class AuthTokenSerializer(serializers.ModelSerializer):
    """Serializer for AuthToken responses.

    Exposes token (key string) and nested member data.
    """

    token = serializers.CharField(source="key", read_only=True)
    member = MemberSerializer(read_only=True)

    class Meta:
        model = AuthToken
        fields = ("token", "member")

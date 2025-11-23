from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuthToken, ChatMessage, Member
from .serializers import (
    AuthTokenSerializer,
    ChatMessageSerializer,
    LoginSerializer,
    MemberSerializer,
    RegistrationSerializer,
)


class RegisterView(APIView):
    """Handle user registration.

    POST /api/auth/register
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = serializer.save()

        # Create (or reuse) authentication token for new member.
        token = AuthToken.objects.create(member=member)
        token_serializer = AuthTokenSerializer(token)
        return Response(token_serializer.data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Handle user login by username and password.

    POST /api/auth/login
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member: Member = serializer.validated_data["member"]

        # Reuse a single token per member if it already exists.
        token, _created = AuthToken.objects.get_or_create(member=member)

        token_serializer = AuthTokenSerializer(token)
        return Response(token_serializer.data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Logout current authenticated user by invalidating current token.

    POST /api/auth/logout
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = getattr(request, "auth", None)
        if isinstance(token, AuthToken):
            token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileView(APIView):
    """Get and update profile of the current authenticated user.

    GET /api/profile
    PUT /api/profile
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        member: Member = request.user
        serializer = MemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        member: Member = request.user

        # Ensure at least one updatable field is provided.
        if "username" not in request.data and "password" not in request.data:
            raise ValidationError({
                "detail": "Необходимо указать хотя бы одно поле для обновления: username или password.",
            })

        serializer = MemberSerializer(member, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChatMessageListCreateView(generics.ListCreateAPIView):
    """List and create chat messages for the global group chat.

    GET /api/chat/messages
    POST /api/chat/messages
    """

    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ChatMessage.objects.select_related("author").order_by("created_at", "id")

        limit_param = self.request.query_params.get("limit")
        offset_param = self.request.query_params.get("offset")

        limit = None
        offset = 0

        if offset_param is not None:
            try:
                offset = int(offset_param)
                if offset < 0:
                    raise ValueError
            except ValueError:
                raise ValidationError({"offset": "Параметр offset должен быть неотрицательным целым числом."})

        if limit_param is not None:
            try:
                limit = int(limit_param)
                if limit <= 0:
                    raise ValueError
            except ValueError:
                raise ValidationError({"limit": "Параметр limit должен быть положительным целым числом."})

        if offset:
            queryset = queryset[offset:]
        if limit is not None:
            queryset = queryset[:limit]

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

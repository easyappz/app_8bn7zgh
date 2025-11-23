from django.urls import path

from .views import (
    ChatMessageListCreateView,
    LoginView,
    LogoutView,
    ProfileView,
    RegisterView,
)


urlpatterns = [
    path("auth/register", RegisterView.as_view(), name="auth-register"),
    path("auth/login", LoginView.as_view(), name="auth-login"),
    path("auth/logout", LogoutView.as_view(), name="auth-logout"),
    path("profile", ProfileView.as_view(), name="profile"),
    path("chat/messages", ChatMessageListCreateView.as_view(), name="chat-messages"),
]

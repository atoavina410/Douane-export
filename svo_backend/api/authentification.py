from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, authentication
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Utilisateur

from .serializers import LoginSerializer

class LoginView(APIView):
    authentication_classes = []   # 🔥 OBLIGATOIRE
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        login = serializer.validated_data["login"]
        password = serializer.validated_data["password"]

        try:
            user = Utilisateur.objects.get(login=login)
        except Utilisateur.DoesNotExist:
            return Response(
                {"detail": "Login incorrect"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):
            return Response(
                {"detail": "Mot de passe incorrect"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "utilisateur": {
                "id": user.id_utilisateur,
                "login": user.login,
                "role": user.id_role.role_nom,
            }
        })


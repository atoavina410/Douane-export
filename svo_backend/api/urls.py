from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .authentification import LoginView
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RoleViewSet, DirectionViewSet, ServiceViewSet, UtilisateurViewSet,DashboardStatsView,
    LogActionViewSet, ValeurExtraitViewSet, ValeurViewSet,PasswordResetConfirmView,
    HistoriqueValeurViewSet, ValidationViewSet, LogoutView, PasswordResetRequestView
)

router = DefaultRouter()

# Un seul enregistrement par ViewSet
router.register(r"roles", RoleViewSet)
router.register(r"directions", DirectionViewSet)
router.register(r"services", ServiceViewSet)
router.register(r"utilisateurs", UtilisateurViewSet)
router.register(r"logactions", LogActionViewSet, basename='logaction') # Utilise ce nom pour correspondre au frontend
router.register(r"extraits", ValeurExtraitViewSet)
router.register(r"valeurs", ValeurViewSet)
router.register(r"historiques", HistoriqueValeurViewSet)
router.register(r"validations", ValidationViewSet)

urlpatterns = [
    # Auth Routes
    path('auth/login/', LoginView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset-confirm/<str:uidb64>/<str:token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    # API Routes (inclut une seule fois)
    path('', include(router.urls)),
]
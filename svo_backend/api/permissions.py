from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "id_role")
            and request.user.id_role.role_nom.upper() == "ADMIN"
        )
class IsChefOrAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        rn = getattr(user, "id_role", None) and user.id_role.role_nom
        return rn in ("ADMIN")

class IsAgentOrAbove(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        rn = getattr(user, "id_role", None) and user.id_role.role_nom
        return rn in ("ADMIN", "ANALYSTE", "VALIDATEUR", "UTILISATEUR")

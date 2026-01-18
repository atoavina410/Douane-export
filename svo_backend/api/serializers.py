from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from datetime import date, timedelta

from .models import (
    Role, Direction, Service, Utilisateur,
    LogAction, ValeurExtrait, Valeur,
    HistoriqueValeur, Validation
)

# =====================================================
# AUTHENTIFICATION
# =====================================================
class LoginSerializer(serializers.Serializer):
    login = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(
            login=data["login"],
            password=data["password"]
        )
        if not user:
            raise serializers.ValidationError("Login ou mot de passe incorrect")
        data["user"] = user
        return data

class ChangeLoginSerializer(serializers.Serializer):
    new_login = serializers.CharField()

    def validate_new_login(self, value):
        if Utilisateur.objects.filter(login=value).exists():
            raise serializers.ValidationError("Login déjà utilisé")
        return value

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField()

# =====================================================
# ROLE / SERVICE / DIRECTION
# =====================================================
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"

class DirectionSerializer(serializers.ModelSerializer):
    services_details = serializers.SerializerMethodField()

    class Meta:
        model = Direction
        fields = ['id_direction', 'direction_nom', 'services_details']

    def get_services_details(self, obj):
        services = Service.objects.filter(id_direction=obj)
        return ServiceSerializer(services, many=True).data

# =====================================================
# UTILISATEURS (CORRIGÉ & COMPLET)
# =====================================================

# 1. Serializer pour l'affichage (Utilisé pour le tableau et "me")
class UtilisateurSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    # Récupération des noms par jointure (Traverse Service -> Direction)
    role_nom = serializers.ReadOnlyField(source='id_role.role_nom')
    service_nom = serializers.ReadOnlyField(source='id_service.service_nom')
    direction_nom = serializers.ReadOnlyField(source='id_service.id_direction.direction_nom')

    class Meta:
        model = Utilisateur
        fields = [
            "id_utilisateur", "login", "password", "nom_utilisateur",
            "prenom_utilisateur", "matricule", "mail", "id_role",     
            "id_service", "role_nom", "service_nom", "direction_nom", 
            "is_active", "is_staff",
        ]
        read_only_fields = ["id_utilisateur"]

# 2. Serializer pour Création / Modification (Gestion des PK)
class CreateUserSerializer(serializers.ModelSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), source='id_role')
    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all(), source='id_service')

    # Champs en lecture seule pour le retour immédiat après création
    role_nom = serializers.ReadOnlyField(source='id_role.role_nom')
    service_nom = serializers.ReadOnlyField(source='id_service.service_nom')
    direction_nom = serializers.ReadOnlyField(source='id_service.id_direction.direction_nom')

    class Meta:
        model = Utilisateur
        fields = [
            "id_utilisateur", "nom_utilisateur", "prenom_utilisateur", "matricule",
            "mail", "login", "password", "role", "service",
            "role_nom", "service_nom", "direction_nom", "is_active"
        ]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},
            "id_utilisateur": {"read_only": False, "required": False}
        }

    def create(self, validated_data):
        return Utilisateur.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

# =====================================================
# VALEURS ET EXTRACTION
# =====================================================
class ValeurExtraitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValeurExtrait
        fields = "__all__"
        read_only_fields = ["id_extraction"]

class ValeurSerializer(serializers.ModelSerializer):
    image = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    statut_validite = serializers.SerializerMethodField()

    class Meta:
        model = Valeur
        fields = "__all__"
        read_only_fields = ["id_valeur", "id_utilisateur", "id_extraction", "status"]

    def get_statut_validite(self, obj):
        date_ref = obj.date_ajout.date() if obj.date_ajout else obj.date_effet
        if not date_ref: return "INCONNU"
        
        today = date.today()
        expiration_date = date_ref + timedelta(days=90)
        alerte_date = expiration_date - timedelta(days=5)

        if today >= expiration_date: return "OBSOLETE"
        elif today >= alerte_date: return "ALERTE"
        return "VALIDE"

    def validate(self, attrs):
        numeric_fields = ["quantite", "pu_fact", "pu_redr", "poid_brut", "poid_net"]
        for field in numeric_fields:
            if attrs.get(field) in ("", None): attrs[field] = None
        return attrs

# =====================================================
# HISTORIQUE / VALIDATION / LOGS
# =====================================================
class HistoriqueValeurSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueValeur
        fields = "__all__"

class ValidationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Validation
        fields = "__all__"

class LogActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogAction
        fields = "__all__"
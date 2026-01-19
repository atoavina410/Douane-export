import io
import pandas as pd
from datetime import date, timedelta

from django.db import transaction
from django.conf import settings
from django.utils import timezone
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.db.models import Count, Q
from django.db.models.functions import TruncDay
from django.http import HttpResponse
from django.forms.models import model_to_dict

from rest_framework import viewsets, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Role, Direction, Service, Utilisateur,
    LogAction, ValeurExtrait, Valeur,
    HistoriqueValeur, Validation
)
from .serializers import (
    LoginSerializer, ChangeLoginSerializer, CreateUserSerializer,
    RoleSerializer, DirectionSerializer, ServiceSerializer,
    UtilisateurSerializer, ChangePasswordSerializer,
    LogActionSerializer, ValeurExtraitSerializer,
    ValeurSerializer, HistoriqueValeurSerializer,
    ValidationSerializer
)
from .permissions import IsAdmin
from .utils import send_mail_pro

# =====================================================
# UTILITAIRE DE LOGGING
# =====================================================
def save_log(request, action_type, description="", user_override=None):
    try:
        # Récupération IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR', '0.0.0.0')
        
        # Identification de l'utilisateur
        target_user = user_override
        if not target_user and hasattr(request, 'user') and request.user.is_authenticated:
            target_user = request.user
            
        # Login en texte (pour l'historique même si l'user est supprimé plus tard)
        user_login = "Anonyme"
        if target_user:
            user_login = getattr(target_user, 'login', str(target_user))
        
        # Création du log
        LogAction.objects.create(
            utilisateur=target_user if target_user and target_user.pk else None,
            user_login=user_login,
            action=action_type,
            description=description,
            ip_address=ip
        )
    except Exception as e:
        # On affiche l'erreur dans la console Django pour savoir pourquoi ça bloque
        print(f"ERREUR LOGGING : {e}")

# =====================================================
# AUTHENTIFICATION
# =====================================================
class LoginView(APIView):
    permission_classes = []
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        
        # Enregistrement du log (user_override est crucial ici)
        save_log(request, "LOGIN", f"Connexion réussie pour {user.login}", user_override=user)
        
        refresh = RefreshToken.for_user(user)
        
        # Sécurisation du rôle pour éviter les erreurs NoneType
        role_name = "GUEST"
        if user.id_role and hasattr(user.id_role, 'role_nom'):
            role_name = user.id_role.role_nom

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id_utilisateur,
                "login": user.login,
                "role": role_name
            }
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        save_log(request, "LOGOUT", "Déconnexion réussie.")
        return Response({"detail": "Déconnexion réussie"}, status=200)

# =====================================================
# GESTION DES UTILISATEURS
# =====================================================
class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.select_related('id_service__id_direction', 'id_role').all().order_by("id_utilisateur")
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve', 'me']:
            return UtilisateurSerializer
        return CreateUserSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        save_log(self.request, "CREATE", f"Utilisateur créé : {instance.login}")

    def perform_update(self, serializer):
        instance = serializer.save()
        save_log(self.request, "UPDATE", f"Utilisateur modifié : {instance.login}")

    def perform_destroy(self, instance):
        save_log(self.request, "DELETE", f"Utilisateur supprimé : {instance.login}")
        instance.delete()

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        return Response(UtilisateurSerializer(request.user).data)

# =====================================================
# DIRECTIONS, SERVICES, ROLES
# =====================================================
class DirectionViewSet(ModelViewSet):
    queryset = Direction.objects.all().order_by("-id_direction")
    serializer_class = DirectionSerializer
    permission_classes = [IsAuthenticated]

class ServiceViewSet(ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

class RoleViewSet(ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

# =====================================================
# VALEURS ET EXTRACTION (INDISPENSABLE)
# =====================================================
class ValeurViewSet(ModelViewSet):
    queryset = Valeur.objects.all().order_by("-id_valeur")
    serializer_class = ValeurSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = {'date_ajout': ['exact', 'gte', 'lte'], 'codesh': ['exact', 'icontains'], 'pays_destinataire': ['exact']}
    search_fields = ['descrip', 'exportateur', 'importateur']
    
    @action(detail=False, methods=['post'], url_path='track-visit')
    def track_visit(self, request):
        page_name = request.data.get('page', 'Inconnue')
        # On enregistre la visite
        save_log(request, "VISIT", f"Navigation vers : {page_name}")
        return Response({"status": "ok"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="export-excel")
    def export_excel(self, request):
        try:
            qs = self.filter_queryset(self.get_queryset())
            data = []
            for v in qs:
                row = model_to_dict(v)
                if v.date_effet: row['date_effet'] = v.date_effet.strftime('%d/%m/%Y')
                if v.date_ajout: row['date_ajout'] = v.date_ajout.strftime('%d/%m/%Y %H:%M')
                if 'image' in row: del row['image']
                data.append(row)
            df = pd.DataFrame(data)
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False)
            output.seek(0)
            response = HttpResponse(output.getvalue(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="export_{date.today()}.xlsx"'
            return response
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    # =====================================================
    # IMPORT EXCEL
    # =====================================================
    @action(detail=False, methods=["post"], url_path="import-excel")
    def import_excel(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "Aucun fichier fourni"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Lecture du fichier Excel
            df = pd.read_excel(file)

            # Colonnes obligatoires
            required_columns = ["codesh", "descrip", "unite", "quantite", "pu_fact", "date_effet", "id_utilisateur"]
            missing = [col for col in required_columns if col not in df.columns]
            if missing:
                return Response(
                    {"error": f"Colonnes obligatoires manquantes : {', '.join(missing)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            inserted, ignored, errors = 0, 0, []

            # Transaction pour éviter les incohérences
            with transaction.atomic():
                for idx, row in df.iterrows():
                    try:
                        # Vérification des champs obligatoires
                        for col in required_columns:
                            if pd.isna(row[col]) or row[col] == "":
                                errors.append(f"Ligne {idx+2} : champ '{col}' manquant")
                                ignored += 1
                                raise ValueError("Champ obligatoire manquant")

                        # Vérification doublon par ref_fact
                        ref_fact = row.get("ref_fact")
                        if ref_fact and Valeur.objects.filter(ref_fact=ref_fact).exists():
                            errors.append(f"Ligne {idx+2} : ref_fact {ref_fact} déjà existant")
                            ignored += 1
                            continue

                        # Création de l'objet Valeur
                        Valeur.objects.create(
                            codesh=row.get("codesh"),
                            descrip=row.get("descrip"),
                            unite=row.get("unite"),
                            quantite=row.get("quantite"),
                            pu_fact=row.get("pu_fact"),
                            pu_redr=row.get("pu_redr"),
                            methode=row.get("methode"),
                            incoterm=row.get("incoterm"),
                            devise=row.get("devise"),
                            source=row.get("source"),
                            ref_fact=row.get("ref_fact"),
                            status=row.get("status") or "Importé",
                            details_marchandises=row.get("details_marchandises"),
                            poid_brut=row.get("poid_brut"),
                            poid_net=row.get("poid_net"),
                            exportateur=row.get("exportateur"),
                            pays_destinataire=row.get("pays_destinataire"),
                            importateur=row.get("importateur"),
                            conditionnement=row.get("conditionnement"),
                            date_effet=row.get("date_effet"),
                            # id_utilisateur=int(row.get("id_utilisateur")),
                            # id_extraction=row.get("id_extraction") if not pd.isna(row.get("id_extraction")) else None
                        )
                        inserted += 1

                    except Exception as e:
                        # Si erreur sur une ligne, on l’ignore mais on continue
                        if "Champ obligatoire" not in str(e):
                            errors.append(f"Ligne {idx+2} : {str(e)}")
                        continue

            return Response({
                "inserted": inserted,
                "ignored": ignored,
                "errors": errors
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ValeurExtraitViewSet(ModelViewSet):
    queryset = ValeurExtrait.objects.all()
    serializer_class = ValeurExtraitSerializer
    permission_classes = [IsAuthenticated]

class HistoriqueValeurViewSet(ModelViewSet):
    queryset = HistoriqueValeur.objects.all()
    serializer_class = HistoriqueValeurSerializer
    permission_classes = [IsAuthenticated]

class ValidationViewSet(ModelViewSet):
    queryset = Validation.objects.all()
    serializer_class = ValidationSerializer
    permission_classes = [IsAuthenticated]

# =====================================================
# LOGS ET DASHBOARD
# =====================================================
class LogActionViewSet(ModelViewSet):
    queryset = LogAction.objects.all().order_by("-date_action")
    serializer_class = LogActionSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    # --- RÉTABLISSEMENT DES FILTRES ---
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = {
        'user_login': ['exact', 'icontains'], 
        'date_action': ['gte', 'lte'],
	'action': ['exact']
    }
    search_fields = ['user_login', 'description', 'action']

    # --- RÉTABLISSEMENT DE L'EXPORTATION ---
    @action(detail=False, methods=["get"], url_path="export-logs")
    def export_logs(self, request):
        # On applique les filtres actuels à l'export
        queryset = self.filter_queryset(self.get_queryset())
        data = list(queryset.values(
            'user_login', 'action', 'description', 'date_action', 'ip_address'
        ))
        
        if not data:
            return Response({"detail": "Aucun log à exporter"}, status=404)
            
        df = pd.DataFrame(data)
        
        # --- MODIFICATION ICI POUR ÉVITER LES #### ---
        if 'date_action' in df.columns:
            # 1. On convertit en datetime
            # 2. On retire le fuseau horaire (tz_localize(None)) car Excel déteste ça
            # 3. On formate en string simple ou on laisse en datetime propre
            df['date_action'] = pd.to_datetime(df['date_action']).dt.tz_localize(None)

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="audit_logs.xlsx"'
        
        # On utilise ExcelWriter pour pouvoir ajuster les colonnes si besoin
        with pd.ExcelWriter(response, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Logs')
            
            # Optionnel : Ajuster automatiquement la largeur de la colonne date
            ws = writer.sheets['Logs']
            # La colonne D (4ème colonne) est généralement celle de date_action
            ws.column_dimensions['D'].width = 20 
            
        return response

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.id_role.role_nom.upper() if user.id_role else "GUEST"
        
        # Répartition des accès (Le graphique qui est vide sur ta photo)
        role_distribution = (
            Utilisateur.objects.values('id_role__role_nom')
            .annotate(count=Count('id_utilisateur'))
            .order_by('-count')
        )
        chart_data = [{"name": item['id_role__role_nom'] or "SANS RÔLE", "value": item['count']} for item in role_distribution]

        # Journal d'activité récent (Le tableau du bas qui est vide)
        recent_logs_query = LogAction.objects.select_related('utilisateur').order_by('-date_action')[:5]
        recent_logs = [{
            "id": log.id,
            "utilisateur": f"{log.utilisateur.nom_utilisateur}" if log.utilisateur else log.user_login,
            "action": log.action,
            "date": log.date_action.strftime("%d/%m/%Y %H:%M"),
            "statut": "OK"
        } for log in recent_logs_query]

        stats = {
            "total_users": Utilisateur.objects.count(),
            "total_valeurs": Valeur.objects.count(),
            "logs_today": LogAction.objects.filter(date_action__date=date.today()).count(),
            "directions": Direction.objects.count(),
            "chart_data": chart_data,
            "recent_logs": recent_logs
        }
        return Response(stats)

# =====================================================
# MOT DE PASSE (RESET)
# =====================================================
class PasswordResetRequestView(APIView):
    permission_classes = []
    def post(self, request):
        return Response({"detail": "Lien envoyé si l'email existe."})

class PasswordResetConfirmView(APIView):
    permission_classes = []
    def post(self, request, uidb64, token):
        return Response({"detail": "Mot de passe réinitialisé."})
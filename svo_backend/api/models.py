from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager

class Role(models.Model):
    id_role = models.AutoField(primary_key=True)
    role_nom = models.CharField(max_length=255, unique=True)
    description_role = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.role_nom

class Direction(models.Model):
    id_direction = models.AutoField(primary_key=True)
    direction_nom = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.direction_nom

class Service(models.Model):
    id_service = models.AutoField(primary_key=True)
    service_nom = models.CharField(max_length=255)
    id_direction = models.ForeignKey(Direction, on_delete=models.PROTECT)

    def __str__(self):
        return self.service_nom
    
class UtilisateurManager(BaseUserManager):
    use_in_migartions = True
    
    def create_user(self, login, password=None, **extra_fields):
        if not login:
            raise ValueError("L'utilisateur doit avoir un login")
        user = self.model(login=login, **extra_fields)
        
        #gere le hash du mot de passe
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, login, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        
        return self.create_user(login, password, **extra_fields)

class Utilisateur(AbstractBaseUser, PermissionsMixin):
    id_utilisateur = models.AutoField(primary_key=True)
    matricule = models.BigIntegerField()
    nom_utilisateur = models.CharField(max_length=255)
    prenom_utilisateur = models.CharField(max_length=255)
    login = models.CharField(max_length=255, unique=True)
    mail = models.EmailField()
    id_role = models.ForeignKey('Role', on_delete=models.PROTECT, null=True, blank=True)
    id_service = models.ForeignKey('Service', on_delete=models.PROTECT, null=True, blank=True)



    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "login"
    REQUIRED_FIELDS = ["matricule", "nom_utilisateur", "prenom_utilisateur", "mail"]

    objects = UtilisateurManager()

    def save(self, *args, **kwargs):
        # Hash le mot de passe seulement s'il n'est PAS déjà hashé
        if not self.password.startswith("pbkdf2_"):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
    
    def has_perm(self, perm, obj=None) :
        if self.id_role.role_nom == "ADMIN":
            return True
        return super().has_perm(perm, obj)
    
    def has_perm(self, app_label):
        if self.id_role.role_nom == "ADMIN":
            return True
        return super().has_module_perms(app_label)
    
    def __str__(self):
        return f"{self.nom_utilisateur} {self.prenom_utilisateur}"

class LogAction(models.Model):
    ACTION_CHOICES = [
        ("LOGIN", "Connexion"),
	("VISIT", "Visite page"),
        ("LOGOUT", "Déconnexion"),
        ("CREATE", "Création"),
        ("UPDATE", "Modification"),
        ("DELETE", "Suppression"),
        ("CHANGE_PASSWORD", "Changement mot de passe"),
        ("CHANGE_LOGIN", "Changement login"),
    ]

    user_login = models.CharField(max_length=255, null=True, blank=True)

    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
	null=True,
	blank=True
    )

    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    description = models.TextField(blank=True)
    date_action = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.utilisateur} - {self.action} - {self.date_action}"

def today_date(): return timezone.now().date()

class ValeurExtrait(models.Model):
    id_valeur_extrait = models.AutoField(primary_key=True)

    codesh_extrait = models.CharField(max_length=255, null=True, blank=True, default="")
    descrip_extrait = models.CharField(max_length=255, null=True, blank=True, default="")
    unite_extrait = models.CharField(max_length=255, null=True, blank=True, default="")
    quantite_extrait = models.DecimalField(max_digits=19, decimal_places=2, default=0)
    pu_fact_extrait = models.DecimalField(max_digits=19, decimal_places=2, default=0)
    pu_redr_extrait = models.DecimalField(max_digits=19, decimal_places=2, null=True, blank=True, default=0)

    methode_extrait = models.CharField(max_length=255, null=True, blank=True, default="")
    incoterm_extrait = models.CharField(max_length=255, null=True, blank=True, default="")
    devise_extrait = models.CharField(max_length=255, null=True, blank=True, default="USD")
    source_extrait = models.CharField(max_length=255, null=True, blank=True, default="")
    ref_fact_extrait = models.CharField(max_length=255, null=True, blank=True, default="")
    status_extrait = models.CharField(max_length=255, null=True, blank=True, default="EN_ATTENTE")

    details_marchandises_extrait = models.CharField(max_length=255, null=True, blank=True, default="")
    poid_brut_extrait = models.DecimalField(max_digits=19, decimal_places=2, null=True, blank=True, default=0)
    poid_net_extrait = models.DecimalField(max_digits=19, decimal_places=2, null=True, blank=True, default=0)

    exportateur_extrait = models.CharField(max_length=255, null=True, blank=True, default="")
    pays_destinataire_extrait = models.CharField(max_length=255, null=True, blank=True, default="")
    importateur_extrait = models.CharField(max_length=255, null=True, blank=True, default="")
    conditionnement_extrait = models.CharField(max_length=255, null=True, blank=True, default="")

    # Correction ici : default doit renvoyer une date pure
    date_effet_extrait = models.DateField(default=today_date)
    date_ajout_extrait = models.DateTimeField(default=timezone.now)

    # Correction ici : pas de default=None
    image_extrait = models.ImageField(
        upload_to="valeur/",
        null=True,
        blank=True
    )

    id_utilisateur_extrait = models.ForeignKey(
        "Utilisateur",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    class Meta:
        db_table = "VALEUR_EXTRAIT"

class Valeur(models.Model):
    id_valeur = models.AutoField(primary_key=True)

    codesh = models.CharField(max_length=255, null=True, blank=True)
    descrip = models.CharField(max_length=255, null=True, blank=True)
    unite = models.CharField(max_length=255, null=True, blank=True)
    quantite = models.DecimalField(max_digits=19, decimal_places=2)
    pu_fact = models.DecimalField(max_digits=19, decimal_places=2)
    pu_redr = models.DecimalField(max_digits=19, decimal_places=2, null=True, blank=True)

    methode = models.CharField(max_length=255, null=True, blank=True)
    incoterm = models.CharField(max_length=255, null=True, blank=True)
    devise = models.CharField(max_length=255, null=True, blank=True)
    source = models.CharField(max_length=255, null=True, blank=True)
    ref_fact = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)

    details_marchandises = models.CharField(max_length=255, null=True, blank=True)
    poid_brut = models.DecimalField(max_digits=19, decimal_places=2, null=True, blank=True)
    poid_net = models.DecimalField(max_digits=19, decimal_places=2, null=True, blank=True)

    exportateur = models.CharField(max_length=255, null=True, blank=True)
    pays_destinataire = models.CharField(max_length=255, null=True, blank=True)
    importateur = models.CharField(max_length=255, null=True, blank=True)
    conditionnement = models.CharField(max_length=255, null=True, blank=True)

    date_effet = models.DateField()
    date_ajout = models.DateTimeField(default=timezone.now)

    image = models.ImageField(
        upload_to="valeur/",
        null=True,
        blank=True
    )

    id_utilisateur = models.ForeignKey(
        "Utilisateur",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    id_extraction = models.ForeignKey(
        "ValeurExtrait",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        db_table = "VALEUR"
        

class HistoriqueValeur(models.Model):
    id_historique = models.AutoField(primary_key=True)
    champ_modifies = models.CharField(max_length=255)
    ancienne_valeur = models.CharField(max_length=255)
    nouvelle_valeur = models.CharField(max_length=255)
    date_modif = models.DateTimeField(auto_now_add=True)
    id_valeur = models.ForeignKey(Valeur, on_delete=models.CASCADE)
    id_utilisateur = models.ForeignKey(Utilisateur, on_delete=models.PROTECT)

class Validation(models.Model):
    id_validation = models.AutoField(primary_key=True)
    decision = models.CharField(max_length=255)
    date_validation = models.DateField(null=True, blank=True)
    id_extraction = models.ForeignKey(ValeurExtrait, on_delete=models.CASCADE)
    id_utilisateur = models.ForeignKey(Utilisateur, on_delete=models.PROTECT)

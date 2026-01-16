import requests
from requests.auth import HTTPBasicAuth
from .models import LogAction

def save_log(request, action_type, description=""):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
    LogAction.objects.create(
        utilisateur=request.user,
        user_login=request.user.login,
        action=action_type,
        description=description,
        ip_address=ip
    )

# --- Fonction d'envoi Mailjet avec Proxy ---
def send_mail_pro(destinataire, sujet, contenu_html):
    url = "https://api.mailjet.com/v3.1/send"
    
    # REMPLACE ICI AVEC TES CLÉS DE L'ÉCRAN MAILJET
    API_KEY = 'f30495db194d08a1b3f3f6f79f94e83f' 
    API_SECRET = 'c9ff8037950bcba6b8c9ccd99885bfce'

    payload = {
        "Messages": [
            {
                "From": {
                    "Email": "atoavina410@gmail.com", # L'email utilisé pour Mailjet
                    "Name": "SVO Support"
                },
                "To": [{"Email": destinataire}],
                "Subject": sujet,
                "HTMLPart": contenu_html
            }
        ]
    }

    proxies = {
        "http": "http://10.2.70.254:3128",
        "https": "http://10.2.70.254:3128"
    }

    try:
        # Tentative via Proxy
        response = requests.post(
            url, 
            json=payload, 
            auth=HTTPBasicAuth(API_KEY, API_SECRET),
            proxies=proxies,
            timeout=10
        )
        return response.status_code
    except:
        # Tentative sans proxy (si tu es sur un réseau public)
        response = requests.post(url, json=payload, auth=HTTPBasicAuth(API_KEY, API_SECRET), timeout=10)
        return response.status_code
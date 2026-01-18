#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    
    # ✅ CONFIGURATION ORACLE - AVANT TOUTE IMPORTATION DJANGO
    os.environ['NLS_LANG'] = 'AMERICAN_AMERICA.AL32UTF8'
    os.environ['NLS_NCHAR'] = 'AL32UTF8'
    os.environ['NLS_DATE_FORMAT'] = 'YYYY-MM-DD HH24:MI:SS'
    os.environ['NLS_TIMESTAMP_FORMAT'] = 'YYYY-MM-DD HH24:MI:SS.FF'
    
    # Forcer l'encoding Python
    if sys.version_info[0] >= 3:
        import locale
        locale.setlocale(locale.LC_ALL, '')
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
from platform import python_version

from django import get_version
from django.db import connection
from django.conf import settings
from django.utils.translation import gettext_lazy as _

DJANGO_VERSION = get_version()
PYTHON_VERSION = python_version()
DB_VENDOR = connection.display_name

if connection.vendor == "postgresql":
    DB_VERSION = connection.pg_version
elif connection.vendor == "mysql":
    DB_VERSION = ".".join(connection.mysql_version)
elif connection.vendor == "sqlite":
    import sqlite3
    DB_VERSION = sqlite3.version
else:
    DB_VERSION = ""

FAVICON = getattr(settings, "PAPER_FAVICON", "paper_admin/dist/assets/default_favicon.png")

ENVIRONMENT_NAME = getattr(settings, "PAPER_ENVIRONMENT_NAME", "")
ENVIRONMENT_COLOR = getattr(settings, "PAPER_ENVIRONMENT_COLOR", "")

MENU = getattr(settings, "PAPER_MENU", None)
MENU_DIVIDER = getattr(settings, "PAPER_MENU_DIVIDER", "-")
MENU_PERM_STAFF = getattr(settings, "PAPER_MENU_PERM_STAFF", "staff")
MENU_PERM_SUPERUSER = getattr(settings, "PAPER_MENU_PERM_SUPERUSER", "superuser")
MENU_HIDE_SINGLE_CHILD = getattr(settings, "PAPER_MENU_HIDE_SINGLE_CHILD", True)

DEFAULT_TAB_NAME = getattr(settings, "PAPER_DEFAULT_TAB_NAME", "general")
DEFAULT_TAB_TITLE = getattr(settings, "PAPER_DEFAULT_TAB_TITLE", _("General"))

LOCALE_PACKAGES = getattr(settings, "PAPER_LOCALE_PACKAGES", ["paper_admin", "django.contrib.admin"])

from django.conf import settings
from django.utils.translation import gettext_lazy as _

ENVIRONMENT_NAME = getattr(settings, "PAPER_ENVIRONMENT_NAME", "")
ENVIRONMENT_COLOR = getattr(settings, "PAPER_ENVIRONMENT_COLOR", "")

SUPPORT_PHONE = getattr(settings, "PAPER_SUPPORT_PHONE", None)
SUPPORT_EMAIL = getattr(settings, "PAPER_SUPPORT_EMAIL", None)
SUPPORT_COMPANY = getattr(settings, "PAPER_SUPPORT_COMPANY", None)
SUPPORT_WEBSITE = getattr(settings, "PAPER_SUPPORT_WEBSITE", None)

MENU = getattr(settings, "PAPER_MENU", None)
MENU_DIVIDER = getattr(settings, "PAPER_MENU_DIVIDER", "-")
MENU_PERM_SUPERUSER = getattr(settings, "PAPER_MENU_PERM_SUPERUSER", "superuser")
MENU_HIDE_SINGLE_CHILD = getattr(settings, "PAPER_MENU_HIDE_SINGLE_CHILD", True)

DEFAULT_TAB_NAME = getattr(settings, "PAPER_DEFAULT_TAB_NAME", "general")
DEFAULT_TAB_TITLE = getattr(settings, "PAPER_DEFAULT_TAB_TITLE", _("General"))

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class Config(AppConfig):
    name = "paper_admin"
    verbose_name = _("Paper Admin")

    def ready(self):
        from .monkey_patch import patch
        patch()

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class Config(AppConfig):
    name = "paper_admin"
    verbose_name = _("Paper Admin")

    def ready(self):
        from .patches import django

        from django.contrib.auth.views import PasswordResetView

        PasswordResetView.html_email_template_name = (
            "registration/password_reset_email_alt.html"
        )

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

# Patch FORMFIELD_FOR_DBFIELD_DEFAULTS
from .patches import formfield_defaults


class Config(AppConfig):
    name = "paper_admin"
    verbose_name = _("Paper Admin")

    def ready(self):
        # Патч django обязательно должен быть импортирован раньше, чем
        # приложение auth. Иначе формы приложения auth будут использовать.
        # виджеты по умолчанию.
        from .patches import django  # isort: skip
        from django.contrib.auth.views import PasswordResetView

        PasswordResetView.html_email_template_name = (
            "registration/password_reset_email_alt.html"
        )

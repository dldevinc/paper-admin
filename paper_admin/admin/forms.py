from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm

from .renderers import PaperFormRenderer


class AdminPasswordResetForm(PasswordResetForm):
    default_renderer = PaperFormRenderer


class AdminSetPasswordForm(SetPasswordForm):
    default_renderer = PaperFormRenderer

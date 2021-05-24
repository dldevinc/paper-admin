from django import forms
from django.contrib.admin.forms import AdminPasswordChangeForm
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import AdminPasswordChangeForm as AuthPasswordChangeForm
from django.contrib.auth.forms import (
    PasswordChangeForm,
    PasswordResetForm,
    SetPasswordForm,
    UserChangeForm,
    UserCreationForm,
)
from django.contrib.auth.views import (
    PasswordChangeView,
    PasswordResetConfirmView,
    PasswordResetView,
)
from django.forms.forms import DeclarativeFieldsMetaclass

from paper_admin.admin.renderers import PaperFormRenderer
from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса Form.
FormMonkeyPatchMeta = type("FormMonkeyPatchMeta", (MonkeyPatchMeta, DeclarativeFieldsMetaclass, ), {})

# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class PatchAdminPasswordChangeForm(AdminPasswordChangeForm, metaclass=FormMonkeyPatchMeta):
    default_renderer = PaperFormRenderer


class PatchAuthPasswordChangeForm(AuthPasswordChangeForm, metaclass=FormMonkeyPatchMeta):
    default_renderer = PaperFormRenderer


class PatchUserAdmin(UserAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    form = type("UserChangeForm", (UserChangeForm,), {
        "default_renderer": PaperFormRenderer
    })
    add_form = type("UserCreationForm", (UserCreationForm,), {
        "default_renderer": PaperFormRenderer
    })


class PatchPasswordResetView(PasswordResetView, metaclass=MonkeyPatchMeta):
    form_class = type("PasswordResetForm", (PasswordResetForm, ), {
        "default_renderer": PaperFormRenderer
    })


class PatchPasswordResetConfirmView(PasswordResetConfirmView, metaclass=MonkeyPatchMeta):
    form_class = type("SetPasswordForm", (SetPasswordForm, ), {
        "default_renderer": PaperFormRenderer
    })


class PatchPasswordChangeView(PasswordChangeView, metaclass=MonkeyPatchMeta):
    form_class = type("PasswordChangeForm", (PasswordChangeForm, ), {
        "default_renderer": PaperFormRenderer
    })

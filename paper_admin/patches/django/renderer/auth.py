from django import forms
from django.contrib.admin.forms import AdminPasswordChangeForm
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import AdminPasswordChangeForm as AuthPasswordChangeForm
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
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

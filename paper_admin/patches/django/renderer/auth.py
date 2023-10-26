from django import forms
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from paper_admin.admin.renderers import PaperFormRenderer
from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class PatchUserAdmin(UserAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    form = type("UserChangeForm", (UserChangeForm,), {
        "default_renderer": PaperFormRenderer
    })
    add_form = type("UserCreationForm", (UserCreationForm,), {
        "default_renderer": PaperFormRenderer
    })

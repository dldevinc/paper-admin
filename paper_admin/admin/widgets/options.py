import copy

from django import forms
from django.contrib.admin.options import BaseModelAdmin
from django.db import models

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

from . import widgets

FORMFIELD_FOR_DBFIELD_DEFAULTS = {
    models.DateTimeField: {
        "form_class": forms.SplitDateTimeField,
        "widget": forms.SplitDateTimeWidget,
    },
    models.TextField: {"widget": widgets.AdminTextarea},
    models.GenericIPAddressField: {"widget": widgets.AdminIPInput},
    models.UUIDField: {"widget": widgets.AdminUUIDInput},
    models.BooleanField: {"widget": widgets.AdminCheckboxInput},
    models.NullBooleanField: {"widget": forms.NullBooleanSelect},
    models.FileField: {"widget": forms.ClearableFileInput},
    models.ImageField: {"widget": forms.ClearableFileInput},
}


# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class PatchBaseModelAdmin(BaseModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    def __init__(self):
        # Merge FORMFIELD_FOR_DBFIELD_DEFAULTS with the formfield_overrides
        # rather than simply overwriting.
        overrides = copy.deepcopy(FORMFIELD_FOR_DBFIELD_DEFAULTS)
        for k, v in self.formfield_overrides.items():
            overrides.setdefault(k, {}).update(v)
        self.formfield_overrides = overrides

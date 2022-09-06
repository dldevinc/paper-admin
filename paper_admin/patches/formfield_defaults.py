from django import forms
from django.contrib.admin.options import FORMFIELD_FOR_DBFIELD_DEFAULTS
from django.db import models

from ..admin import widgets

FORMFIELD_FOR_DBFIELD_DEFAULTS.clear()
FORMFIELD_FOR_DBFIELD_DEFAULTS.update({
    models.DateTimeField: {
        "form_class": forms.SplitDateTimeField,
        "widget": forms.SplitDateTimeWidget,
    },
    models.TextField: {"widget": widgets.AdminTextarea},
    models.GenericIPAddressField: {"widget": widgets.AdminIPInput},
    models.UUIDField: {"widget": widgets.AdminUUIDInput},
    models.BooleanField: {"widget": widgets.AdminCheckboxInput},
    models.FileField: {"widget": forms.ClearableFileInput},
    models.ImageField: {"widget": forms.ClearableFileInput},
})

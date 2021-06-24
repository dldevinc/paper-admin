import copy

from django import forms
from django.contrib.admin.options import BaseModelAdmin
from django.contrib.admin.widgets import AutocompleteSelect, AutocompleteSelectMultiple
from django.db import models
from django.utils.translation import gettext as _

from paper_admin.admin import widgets
from paper_admin.monkey_patch import MonkeyPatchMeta

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

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name in self.radio_fields:
            if "widget" not in kwargs:
                kwargs["widget"] = widgets.AdminRadioSelect()
            if "choices" not in kwargs:
                kwargs["choices"] = db_field.get_choices(
                    include_blank=db_field.blank,
                    blank_choice=[("", _("None"))]
                )
        return db_field.formfield(**kwargs)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        db = kwargs.get('using')

        if db_field.name in self.get_autocomplete_fields(request):
            kwargs["widget"] = AutocompleteSelect(
                db_field.remote_field,
                self.admin_site,
                using=db
            )
        elif db_field.name in self.raw_id_fields:
            kwargs["widget"] = widgets.AdminForeignKeyRawIdWidget(
                db_field.remote_field,
                self.admin_site,
                using=db
            )
        elif db_field.name in self.radio_fields:
            kwargs["widget"] = widgets.AdminRadioSelect()
            kwargs["empty_label"] = _("None") if db_field.blank else None

        if "queryset" not in kwargs:
            queryset = self.get_field_queryset(db, db_field, request)
            if queryset is not None:
                kwargs["queryset"] = queryset

        return db_field.formfield(**kwargs)

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if not db_field.remote_field.through._meta.auto_created:
            return None

        db = kwargs.get("using")

        autocomplete_fields = self.get_autocomplete_fields(request)
        if db_field.name in autocomplete_fields:
            kwargs['widget'] = AutocompleteSelectMultiple(
                db_field.remote_field,
                self.admin_site,
                using=db
            )
        elif db_field.name in self.raw_id_fields:
            kwargs["widget"] = widgets.AdminManyToManyRawIdWidget(
                db_field.remote_field,
                self.admin_site,
                using=db
            )
        elif db_field.name in list(self.filter_vertical) + list(self.filter_horizontal):
            kwargs["widget"] = widgets.FilteredSelectMultiple()
        else:
            kwargs.setdefault("widget", forms.SelectMultiple)

        if "queryset" not in kwargs:
            queryset = self.get_field_queryset(db, db_field, request)
            if queryset is not None:
                kwargs["queryset"] = queryset

        return db_field.formfield(**kwargs)

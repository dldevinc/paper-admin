import types

from django.db import models


def extend_class(target, mixin):
    for name, obj in mixin.__dict__.items():
        if isinstance(obj, (types.FunctionType, property)):
            if getattr(target, name, None):
                setattr(target, name + "__overridden", getattr(target, name))
        elif name.startswith("__"):
            # skip system attributes
            continue
        setattr(target, name, obj)


def extend_model(target, mixin):
    for name, obj in mixin.__dict__.items():
        if isinstance(obj, (types.FunctionType, property)):
            if getattr(target, name, None):
                setattr(target, name + "__overridden", getattr(target, name))
        elif isinstance(obj, models.Field):
            remove_model_field(target, name)
        elif name.startswith("__"):
            # skip system attributes
            continue

        target.add_to_class(name, obj)


def remove_model_field(model, field_name):
    for field_table in (model._meta.local_fields, model._meta.local_many_to_many):
        for index, field in enumerate(field_table):
            if field.name == field_name:
                field_table.pop(index)
                break


def patch():
    from django.contrib.admin import helpers, options, widgets
    from django.contrib.auth.forms import (
        AdminPasswordChangeForm,
        PasswordResetForm,
        SetPasswordForm,
    )
    from django.contrib.auth.views import PasswordResetView

    from .admin.helpers import AdminForm, InlineAdminFormSet
    from .admin.options import (
        PaperBaseModelAdmin,
        PaperInlineModelAdmin,
        PaperModelAdmin,
        RelatedFieldWidgetWrapper,
    )
    from .renderer import PaperFormRenderer
    extend_class(options.BaseModelAdmin, PaperBaseModelAdmin)
    extend_class(options.ModelAdmin, PaperModelAdmin)
    extend_class(options.InlineModelAdmin, PaperInlineModelAdmin)
    extend_class(widgets.RelatedFieldWidgetWrapper, RelatedFieldWidgetWrapper)
    helpers.AdminForm = AdminForm
    helpers.InlineAdminFormSet = InlineAdminFormSet

    AdminPasswordChangeForm.default_renderer = PaperFormRenderer
    PasswordResetForm.default_renderer = PaperFormRenderer
    SetPasswordForm.default_renderer = PaperFormRenderer
    PasswordResetView.html_email_template_name = "registration/password_reset_email_alt.html"

from django import forms
from django.contrib.admin.helpers import (
    ActionForm,
    AdminReadonlyField,
    Fieldset,
    InlineAdminForm,
    InlineAdminFormSet,
)
from django.contrib.admin.utils import flatten_fieldsets
from django.forms.forms import DeclarativeFieldsMetaclass
from django.utils.functional import cached_property

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

# Метакласс MonkeyPatch для класса Form.
FormMonkeyPatchMeta = type("FormMonkeyPatchMeta", (MonkeyPatchMeta, DeclarativeFieldsMetaclass, ), {})


class PatchActionForm(ActionForm, metaclass=FormMonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        get_original(ActionForm)(self, *args, **kwargs)
        self.fields["action"].widget.attrs["form"] = "changelist-form"
        self.fields["action"].widget.attrs["class"] = "custom-select"


class PatchAdminReadonlyField(AdminReadonlyField, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        get_original(AdminReadonlyField)(self, *args, **kwargs)
        self.field["contents"] = self.contents()


class PatchFieldset(Fieldset, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        get_original(Fieldset)(self, *args, **kwargs)
        self.has_visible_field = not all(
            field in self.form.fields and self.form.fields[field].widget.is_hidden
            for line in self
            for field in line.fields
        )

    @property
    def media(self):
        return forms.Media()

    @cached_property
    def errors(self):
        # Используется для определения и выделения вкладки, на которой есть ошибки
        errors = []
        for line in self:
            for field in line.fields:
                if field in line.readonly_fields:
                    continue

                for error in self.form[field].errors:
                    errors.append(error)

        return errors


class PatchInlineAdminFormSet(InlineAdminFormSet, metaclass=MonkeyPatchMeta):
    # Шаблон формы перенесен из итератора в отдельное поле empty_form.
    def __iter__(self):
        if self.has_change_permission:
            readonly_fields_for_editing = self.readonly_fields
        else:
            readonly_fields_for_editing = self.readonly_fields + flatten_fieldsets(self.fieldsets)

        for form, original in zip(self.formset.initial_forms, self.formset.get_queryset()):
            view_on_site_url = self.opts.get_view_on_site_url(original)
            yield InlineAdminForm(
                self.formset, form, self.fieldsets, self.prepopulated_fields,
                original, readonly_fields_for_editing, model_admin=self.opts,
                view_on_site_url=view_on_site_url,
            )
        for form in self.formset.extra_forms:
            yield InlineAdminForm(
                self.formset, form, self.fieldsets, self.prepopulated_fields,
                None, self.readonly_fields, model_admin=self.opts,
            )

    @property
    def empty_form(self):
        return InlineAdminForm(
            self.formset,
            self.formset.empty_form,
            self.fieldsets,
            self.prepopulated_fields,
            None,
            self.readonly_fields,
            model_admin=self.opts,
        )

    @property
    def non_field_errors(self):
        return [
            error
            for form in self.formset.forms
            for error in form.non_field_errors()
        ]

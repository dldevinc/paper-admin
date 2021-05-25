from django import forms
from django.contrib.admin.helpers import (
    ActionForm,
    AdminField,
    AdminForm,
    AdminReadonlyField,
    Fieldset,
    Fieldline,
    InlineAdminForm,
    InlineAdminFormSet,
    InlineFieldset,
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


class PatchAdminField(AdminField, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        prepopulated_fields = kwargs.pop("prepopulated_fields", None) or {}
        get_original(AdminField)(self, *args, **kwargs)
        self.is_prepopulated = self.field.name in prepopulated_fields


class PatchAdminReadonlyField(AdminReadonlyField, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        get_original(AdminReadonlyField)(self, *args, **kwargs)
        self.is_prepopulated = False
        self.field["contents"] = self.contents()


class PatchFieldline(Fieldline, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        self.prepopulated_fields = kwargs.pop("prepopulated_fields", None) or {}
        get_original(Fieldline)(self, *args, **kwargs)

    def __iter__(self):
        for i, field in enumerate(self.fields):
            if field in self.readonly_fields:
                yield AdminReadonlyField(
                    self.form,
                    field,
                    is_first=(i == 0),
                    model_admin=self.model_admin
                )
            else:
                yield AdminField(
                    self.form,
                    field,
                    is_first=(i == 0),
                    prepopulated_fields=self.prepopulated_fields
                )

    @cached_property
    def errors(self):
        return [
            self.form[field].errors
            for field in self.fields if field not in self.readonly_fields
        ]


class PatchFieldset(Fieldset, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        prepopulated_fields = kwargs.pop("prepopulated_fields", None)
        get_original(Fieldset)(self, *args, **kwargs)
        self.prepopulated_fields = prepopulated_fields or {}
        self.has_visible_field = not all(
            field in self.form.fields and self.form.fields[field].widget.is_hidden
            for line in self.lines
            for field in line.fields
        )

    def __iter__(self):
        return iter(self.lines)

    @cached_property
    def lines(self):
        return tuple(
            Fieldline(
                self.form,
                field,
                self.readonly_fields,
                model_admin=self.model_admin,
                prepopulated_fields=self.prepopulated_fields
            )
            for field in self.fields
        )

    @property
    def media(self):
        return forms.Media()

    @cached_property
    def errors(self):
        errors = []
        for line in self:
            for field in line.fields:
                if field in line.readonly_fields:
                    continue

                for error in self.form[field].errors:
                    errors.append(error)

        return errors


class PatchAdminForm(AdminForm, metaclass=MonkeyPatchMeta):
    def __init__(
        self,
        form,
        fieldsets,
        prepopulated_fields,
        readonly_fields=None,
        model_admin=None
    ):
        get_original(AdminForm)(
            self,
            form,
            fieldsets,
            prepopulated_fields,
            readonly_fields=readonly_fields,
            model_admin=model_admin
        )
        self.prepopulated_fields = prepopulated_fields

    def __iter__(self):
        for name, options in self.fieldsets:
            yield Fieldset(
                self.form,
                name,
                readonly_fields=self.readonly_fields,
                model_admin=self.model_admin,
                prepopulated_fields=self.prepopulated_fields,
                **options
            )


class PatchInlineFieldset(InlineFieldset, metaclass=MonkeyPatchMeta):
    def __iter__(self):
        return iter(self.lines)

    @cached_property
    def lines(self):
        fk = getattr(self.formset, "fk", None)
        return tuple(
            Fieldline(
                self.form,
                field,
                self.readonly_fields,
                model_admin=self.model_admin,
                prepopulated_fields=self.prepopulated_fields
            )
            for field in self.fields
            if not fk or fk.name != field
        )


class PatchInlineAdminForm(InlineAdminForm, metaclass=MonkeyPatchMeta):
    def __iter__(self):
        for name, options in self.fieldsets:
            yield InlineFieldset(
                self.formset,
                self.form,
                name,
                self.readonly_fields,
                model_admin=self.model_admin,
                prepopulated_fields=self.prepopulated_fields,
                **options
            )


class PatchInlineAdminFormSet(InlineAdminFormSet, metaclass=MonkeyPatchMeta):
    """
    Шаблон формы перенесен из итератора в отдельное поле empty_form.
    """
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

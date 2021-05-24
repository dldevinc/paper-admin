from collections import Iterable

from django import forms
from django.contrib.admin.helpers import (
    ActionForm,
    AdminField,
    AdminForm,
    AdminReadonlyField,
    Fieldset,
    InlineAdminForm,
    InlineAdminFormSet,
    InlineFieldset,
)
from django.contrib.admin.utils import flatten_fieldsets
from django.forms.forms import DeclarativeFieldsMetaclass
from django.utils.functional import cached_property

from ..monkey_patch import MonkeyPatchMeta, get_original


# Метакласс MonkeyPatch для класса Form.
FormMonkeyPatchMeta = type("FormMonkeyPatchMeta", (MonkeyPatchMeta, DeclarativeFieldsMetaclass, ), {})


class PatchActionForm(ActionForm, metaclass=FormMonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        get_original(ActionForm)(self, *args, **kwargs)
        self.fields["action"].widget.attrs["form"] = "changelist-form"


class PatchPrepopulatedFields(AdminForm, metaclass=MonkeyPatchMeta):
    """
    Отмена конвертации словаря prepopulated_fields в список в методе __init__.
    Вместо этого в поле prepopulated_fields сохраняется исходное значение, а
    а конвертация происходит в шаблонном теге prepopulated_fields_js.

    Такой функционал необходим из-за обновленной реализации inline-форм.
    Исходная реализация добавляла CSS-класс "prepopulated_field" полям,
    перечисленным в "prepopulated_fields_js". Но из-за того, что в новой
    реализации inline-форм шаблон формы (empty-form) хранися не в напрямую
    в DOM-дереве, а в <template>, это приводит к тому, что функционал
    "prepopulated_field" не работает для динамически добавленных форм.
    """
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


class PatchFieldset(Fieldset, metaclass=MonkeyPatchMeta):
    """
    1. Добавлено поле prepopulated_fields.
    2. Удалена статика.
    3. Отмена Fieldline.
    """
    def __init__(self, *args, **kwargs):
        prepopulated_fields = kwargs.pop("prepopulated_fields", None)
        get_original(Fieldset)(self, *args, **kwargs)

        self.prepopulated_fields = prepopulated_fields or {}
        self.has_visible_field = not all(
            field in self.form.fields and self.form.fields[field].widget.is_hidden
            for field in self.fields
        )

    @property
    def media(self):
        # disable collapse
        return forms.Media()

    def __iter__(self):
        for fieldname in self.plain_fields():
            if fieldname in self.readonly_fields:
                yield AdminReadonlyField(
                    self.form,
                    fieldname,
                    is_first=False,
                    model_admin=self.model_admin
                )
            else:
                yield AdminField(
                    self.form,
                    fieldname,
                    is_first=False,
                    prepopulated_fields=self.prepopulated_fields
                )

    @cached_property
    def errors(self):
        errors = []
        for fieldname in self.plain_fields():
            if fieldname in self.readonly_fields:
                continue
            for error in self.form[fieldname].errors:
                errors.append(error)
        return errors

    def plain_fields(self):
        for field in self.fields:
            if isinstance(field, str):
                yield field
            elif isinstance(field, Iterable):
                yield from field
            else:
                raise TypeError("unsupported field type: {}".format(field))


class PatchAdminField(AdminField, metaclass=MonkeyPatchMeta):
    """
    Добавлено поле is_prepopulated.
    """
    def __init__(self, form, field, is_first, prepopulated_fields=None):
        get_original(AdminField)(self, form, field, is_first)

        prepopulated_fields = prepopulated_fields or {}
        self.is_prepopulated = self.field.name in prepopulated_fields


class PatchAdminReadonlyField(AdminReadonlyField, metaclass=MonkeyPatchMeta):
    """
    Т.к. в admin_field.html мы используем поле формы, а не AdminReadonlyField,
    переносим контент в поле.
    """
    def __init__(self, form, field, is_first, model_admin=None):
        get_original(AdminReadonlyField)(self, form, field, is_first, model_admin=model_admin)
        self.is_prepopulated = False
        self.field["contents"] = self.contents()


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


class PatchInlineAdminForm(InlineAdminForm, metaclass=MonkeyPatchMeta):
    """
    Добавлен prepopulated_fields.
    """
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


class PatchInlineFieldset(InlineFieldset, metaclass=MonkeyPatchMeta):
    """
    Отмена Fieldline.
    Добавлен prepopulated_fields.
    """
    def __iter__(self):
        fk = getattr(self.formset, "fk", None)
        for fieldname in self.plain_fields():
            if fk and fk.name == fieldname:
                continue
            if fieldname in self.readonly_fields:
                yield AdminReadonlyField(
                    self.form,
                    fieldname,
                    is_first=False,
                    model_admin=self.model_admin,
                )
            else:
                yield AdminField(
                    self.form,
                    fieldname,
                    is_first=False,
                    prepopulated_fields=self.prepopulated_fields
                )

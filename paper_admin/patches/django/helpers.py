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
from django.utils.functional import cached_property, lazy

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

# Метакласс MonkeyPatch для класса Form.
FormMonkeyPatchMeta = type("FormMonkeyPatchMeta", (MonkeyPatchMeta, DeclarativeFieldsMetaclass, ), {})


class PatchActionForm(ActionForm, metaclass=FormMonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        get_original(ActionForm)(self, *args, **kwargs)
        self.fields["action"].widget.attrs["form"] = "changelist-form"
        self.fields["action"].widget.attrs["class"] = "custom-select"
        self.fields["select_across"].widget.attrs["form"] = "changelist-form"


class PatchAdminReadonlyField(AdminReadonlyField, metaclass=MonkeyPatchMeta):
    def __init__(self, form, field, is_first, model_admin=None):
        get_original(AdminReadonlyField)(self, form, field, is_first, model_admin)
        # Переносим контент во внутренний словарь `field` и добавляем `html_name`,
        # чтобы сделать поля внутреннего словаря "self.field" похожими на свойства
        # редактируемого поля. Благодаря этому мы сможем использовать единый шаблон
        # для обоих типов полей.
        self.field["html_name"] = form.add_prefix(self.field["name"])
        self.field["contents"] = lazy(self.contents, str)


class PatchFieldset(Fieldset, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        get_original(Fieldset)(self, *args, **kwargs)
        # Перенос свойства `has_visible_field` в Fieldset,
        # чтобы не рендерить пустые блоки.
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
    def __iter__(self):
        if self.has_change_permission:
            readonly_fields_for_editing = self.readonly_fields
        else:
            readonly_fields_for_editing = self.readonly_fields + flatten_fieldsets(self.fieldsets)

        # При отправке формсета порядок форм мог быть изменён (из-за свойства sortable).
        # Формы, связанные с экземплярами в БД (имеющие `original`), могли оказаться ниже,
        # чем дополнительные (extra_forms). Поэтому для случая связанного (`is_bound`)
        # формсета мы сопоставляем формы с экземплярами на основании значений
        # поля pk.
        if self.formset.is_bound:
            pk_name = self.formset._pk_field.name

            originals = {
                str(item.pk): item
                for item in self.formset.get_queryset()
            }

            for form in self.formset:
                pk_value = form[pk_name].value()
                if pk_value in originals:
                    original = originals[pk_value]
                    view_on_site_url = self.opts.get_view_on_site_url(original)
                    yield InlineAdminForm(
                        self.formset, form, self.fieldsets, self.prepopulated_fields,
                        original, readonly_fields_for_editing, model_admin=self.opts,
                        view_on_site_url=view_on_site_url,
                    )
                else:
                    yield InlineAdminForm(
                        self.formset, form, self.fieldsets, self.prepopulated_fields,
                        None, self.readonly_fields, model_admin=self.opts,
                    )
        else:
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

            # Рендеринг пустой формы перенесён в отдельное свойство empty_form,
            # чтобы рендерить его в любой месте на странице.

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
        # Свойство для стилизации ошибочных инлайн-форм
        return [
            error
            for form in self.formset.forms
            for error in form.non_field_errors()
        ]

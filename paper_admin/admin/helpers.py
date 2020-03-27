from collections import Iterable
from django import forms
from django.contrib.admin import helpers
from django.contrib.admin.utils import label_for_field, help_text_for_field, flatten_fieldsets
from django.utils.functional import cached_property
from ..forms.widgets import CustomCheckboxInput


class ActionForm(helpers.ActionForm):
    """
        Убираем атрибут required у выпадающего списка,
        т.к. из-за него не отправляется форма.

        См. novalidate для bootstrap:
            http://getbootstrap.com/docs/4.0/components/forms/#custom-styles
    """
    action = forms.ChoiceField(
        label='',
        required=False,
        widget=forms.Select(attrs={
            'class': 'custom-select custom-select-sm',
        })
    )

    def clean_action(self):
        value = self.cleaned_data.get('action')
        field = self.fields.get('action')
        if field and not value:
            self.add_error('action', field.error_messages.get('required'))
        return value


checkbox = CustomCheckboxInput({'class': 'action-select'}, lambda value: False)
checkbox_toggle = CustomCheckboxInput({'id': 'action-toggle'}, lambda value: False)


AdminFormOriginal = helpers.AdminForm


class AdminForm(AdminFormOriginal):
    @cached_property
    def fieldset_items(self):
        return [
            Fieldset(
                self.form, name,
                readonly_fields=self.readonly_fields,
                model_admin=self.model_admin,
                **options
            )
            for name, options in self.fieldsets
        ]

    def __iter__(self):
        return iter(self.fieldset_items)


class Fieldset(helpers.Fieldset):
    def __init__(self, form, name=None, readonly_fields=(), fields=(), classes=(),
            tab=None, description=None, model_admin=None):
        super().__init__(form, name, readonly_fields, fields, classes, description, model_admin)
        self._tab = tab
        self.has_visible_field = not all(
            field in self.form.fields and self.form.fields[field].widget.is_hidden
            for field in self.fields
        )

    @property
    def media(self):
        # disable collapse
        return forms.Media()

    def __iter__(self):
        for fieldname in self.iter_fields():
            if fieldname in self.readonly_fields:
                yield AdminReadonlyField(self.form, fieldname, model_admin=self.model_admin)
            else:
                yield AdminField(self.form, fieldname)

    @cached_property
    def errors(self):
        errors = []
        for fieldname in self.iter_fields():
            if fieldname in self.readonly_fields:
                continue
            for error in self.form[fieldname].errors:
                errors.append(error)
        return errors

    def iter_fields(self):
        for field in self.fields:
            if isinstance(field, str):
                yield field
            elif isinstance(field, Iterable):
                yield from field
            else:
                raise TypeError('unsupported field type: {}'.format(field))

    @property
    def tab(self):
        return self._tab


class AdminField:
    def __init__(self, form, field):
        self.field = form[field]  # A django.forms.BoundField instance
        self.is_checkbox = isinstance(self.field.field.widget, forms.CheckboxInput)
        self.is_readonly = False

    def __str__(self):
        return str(self.field)


class AdminReadonlyField(helpers.AdminReadonlyField):
    def __init__(self, form, field, model_admin=None):
        if callable(field):
            class_name = field.__name__ if field.__name__ != '<lambda>' else ''
        else:
            class_name = field

        if form._meta.labels and class_name in form._meta.labels:
            label = form._meta.labels[class_name]
        else:
            label = label_for_field(field, form._meta.model, model_admin)

        if form._meta.help_texts and class_name in form._meta.help_texts:
            help_text = form._meta.help_texts[class_name]
        else:
            help_text = help_text_for_field(class_name, form._meta.model)

        self.field = {
            'name': class_name,
            'label': label,
            'help_text': help_text,
            'field': field,
        }
        self.form = form
        self.model_admin = model_admin
        self.is_checkbox = False
        self.is_readonly = True
        self.empty_value_display = model_admin.get_empty_value_display()
        self.field['contents'] = self.contents()


class InlineAdminForm(helpers.InlineAdminForm):
    def __iter__(self):
        for name, options in self.fieldsets:
            yield InlineFieldset(
                self.formset, self.form, name, self.readonly_fields,
                model_admin=self.model_admin, **options
            )

    def pk_field(self):
        return AdminField(self.form, self.formset._pk_field.name)

    def fk_field(self):
        fk = getattr(self.formset, "fk", None)
        if fk:
            return AdminField(self.form, fk.name)
        else:
            return ""

    def deletion_field(self):
        from django.forms.formsets import DELETION_FIELD_NAME
        return AdminField(self.form, DELETION_FIELD_NAME)

    def ordering_field(self):
        from django.forms.formsets import ORDERING_FIELD_NAME
        return AdminField(self.form, ORDERING_FIELD_NAME)


class InlineFieldset(Fieldset):
    def __init__(self, formset, *args, **kwargs):
        self.formset = formset
        super().__init__(*args, **kwargs)

    def __iter__(self):
        fk = getattr(self.formset, "fk", None)
        for fieldname in self.iter_fields():
            if fk and fk.name == fieldname:
                continue
            if fieldname in self.readonly_fields:
                yield AdminReadonlyField(self.form, fieldname, model_admin=self.model_admin)
            else:
                yield AdminField(self.form, fieldname)

    def iter_fields(self):
        for field in self.fields:
            if isinstance(field, str):
                yield field
            elif isinstance(field, Iterable):
                yield from field
            else:
                raise TypeError('unsupported field type: {}'.format(field))


InlineAdminFormSetOriginal = helpers.InlineAdminFormSet


class InlineAdminFormSet(InlineAdminFormSetOriginal):
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
        if self.has_add_permission:
            yield InlineAdminForm(
                self.formset, self.formset.empty_form,
                self.fieldsets, self.prepopulated_fields, None,
                self.readonly_fields, model_admin=self.opts,
            )

    @property
    def non_field_errors(self):
        return [
            error
            for form in self.formset.forms
            for error in form.non_field_errors()
        ]

    @property
    def tab(self):
        return getattr(self.opts, 'tab', None)


class AdminTab:
    def __init__(self, request, name, title):
        self.request = request
        self._name = name
        self._title = title
        self.active = False
        self.fieldsets = []
        self.inline_formsets = []

    @property
    def name(self):
        return self._name

    @property
    def title(self):
        return self._title

    @cached_property
    def invalid(self):
        return any(f.errors for f in self.fieldsets) or any(
            f.errors
            for fs in self.inline_formsets
            for f in fs
        )

from django import forms
from django.contrib.admin.widgets import AutocompleteMixin as DefaultAutocompleteMixin
from django.contrib.admin.widgets import (
    ForeignKeyRawIdWidget as DefaultForeignKeyRawIdWidget,
)
from django.contrib.admin.widgets import (
    ManyToManyRawIdWidget as DefaultManyToManyRawIdWidget,
)
from django.forms.utils import to_current_timezone


class IPInput(forms.TextInput):
    template_name = "django/forms/widgets/ip.html"


class UUIDInput(forms.TextInput):
    template_name = "django/forms/widgets/uuid.html"


class DateInput(forms.DateInput):
    input_type = "text"
    template_name = "django/forms/widgets/date.html"


class SplitDateTimeInput(forms.MultiWidget):
    template_name = "django/forms/widgets/splitdatetime.html"
    supports_microseconds = False

    def __init__(self, widgets=None, attrs=None):
        if widgets is None:
            widgets = (DateInput, forms.TimeInput)
        super().__init__(widgets, attrs)

    def decompress(self, value):
        if value:
            value = to_current_timezone(value)
            return [value.date(), value.time().replace(microsecond=0)]
        return [None, None]


class SplitHiddenDateTimeWidget(SplitDateTimeInput):
    template_name = "django/forms/widgets/splithiddendatetime.html"

    def __init__(self, widgets=None, attrs=None):
        if widgets is None:
            widgets = (forms.HiddenInput, forms.HiddenInput)
        super().__init__(widgets, attrs)


class AutocompleteMixin(DefaultAutocompleteMixin):
    @property
    def media(self):
        return forms.Media()


class AutocompleteSelect(AutocompleteMixin, forms.Select):
    pass


class AutocompleteSelectMultiple(AutocompleteMixin, forms.SelectMultiple):
    pass


class ForeignKeyRawIdWidget(DefaultForeignKeyRawIdWidget):
    template_name = "django/forms/widgets/foreign_key_raw_id.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        rel_to = self.rel.model
        if rel_to in self.admin_site._registry:
            classes = context["widget"]["attrs"].get("class", "")
            classes += " form-control"
            context["widget"]["attrs"]["class"] = classes
        return context


class ManyToManyRawIdWidget(DefaultManyToManyRawIdWidget):
    template_name = "django/forms/widgets/many_to_many_raw_id.html"

    def get_context(self, name, value, attrs):
        context = super(DefaultManyToManyRawIdWidget, self).get_context(name, value, attrs)
        if self.rel.model in self.admin_site._registry:
            classes = context["widget"]["attrs"].get("class", "")
            classes += " vManyToManyRawIdAdminField form-control"
            context["widget"]["attrs"]["class"] = classes
        return context


class AutosizeTextarea(forms.Textarea):
    def __init__(self, attrs=None):
        default_attrs = {"rows": "3", "autosize": True}
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)


class SwitchInput(forms.CheckboxInput):
    template_name = "django/forms/widgets/switch.html"


class CustomCheckboxInput(forms.CheckboxInput):
    template_name = "django/forms/widgets/checkbox_custom.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        widget_class = context["widget"]["attrs"].pop("widget_class", "")
        context["widget_class"] = widget_class
        return context


class CustomRadioSelect(forms.RadioSelect):
    template_name = "django/forms/widgets/radio_custom.html"
    option_template_name = "django/forms/widgets/radio_option_custom.html"


class CustomCheckboxSelectMultiple(forms.CheckboxSelectMultiple):
    template_name = "django/forms/widgets/checkbox_select.html"
    option_template_name = "django/forms/widgets/checkbox_custom.html"


class FilteredSelectMultiple(forms.SelectMultiple):
    template_name = "django/forms/widgets/filtered_select.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context["widget"]["attrs"]["class"] = "vMultiSelect"
        return context

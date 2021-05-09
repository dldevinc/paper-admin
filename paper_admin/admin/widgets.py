import json

from django import forms
from django.contrib.admin.widgets import AutocompleteMixin as DefaultAutocompleteMixin
from django.contrib.admin.widgets import ForeignKeyRawIdWidget, ManyToManyRawIdWidget
from django.forms import MediaDefiningClass

from ..monkey_patch import MonkeyPatchMeta, get_original


# Метакласс MonkeyPatch для класса Widget.
WidgetMonkeyPatchMeta = type("WidgetMonkeyPatchMeta", (MonkeyPatchMeta, widgets.MediaDefiningClass, ), {})


class AdminIPInput(forms.TextInput):
    template_name = "django/forms/widgets/ip.html"


class AdminUUIDInput(forms.TextInput):
    template_name = "django/forms/widgets/uuid.html"


class AdminSwitchInput(forms.CheckboxInput):
    template_name = "django/forms/widgets/switch.html"


class AdminTextarea(forms.Textarea):
    def __init__(self, attrs=None):
        default_attrs = {"rows": "3", "autosize": True}
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)


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


class AdminSelectMultiple(forms.SelectMultiple):
    # TODO: использовать другой плагин
    template_name = "django/forms/widgets/filtered_select.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context["widget"]["attrs"]["class"] = "vMultiSelect"
        return context


class AutocompleteMixin(DefaultAutocompleteMixin):
    @property
    def media(self):
        return forms.Media()

    def build_attrs(self, base_attrs, extra_attrs=None):
        # удалена тема admin-autocomplete
        attrs = super(DefaultAutocompleteMixin, self).build_attrs(base_attrs, extra_attrs=extra_attrs)
        attrs.setdefault('class', '')
        attrs.update({
            'data-ajax--cache': 'true',
            'data-ajax--type': 'GET',
            'data-ajax--url': self.get_url(),
            'data-allow-clear': json.dumps(not self.is_required),
            'data-placeholder': '',  # Allows clearing of the input.
            'class': attrs['class'] + (' ' if attrs['class'] else '') + 'admin-autocomplete',
        })
        return attrs


class AutocompleteSelect(AutocompleteMixin, forms.Select):
    pass


class AutocompleteSelectMultiple(AutocompleteMixin, forms.SelectMultiple):
    pass


class PatchForeignKeyRawIdWidget(ForeignKeyRawIdWidget, metaclass=WidgetMonkeyPatchMeta):
    template_name = "django/forms/widgets/foreign_key_raw_id.html"

    def __init__(self, rel, admin_site, attrs=None, using=None):
        attrs = {'class': 'form-control', **(attrs or {})}
        get_original(ForeignKeyRawIdWidget)(self, rel, admin_site, attrs=attrs, using=using)


class PatchManyToManyRawIdWidget(ManyToManyRawIdWidget, metaclass=WidgetMonkeyPatchMeta):
    template_name = "django/forms/widgets/many_to_many_raw_id.html"

    def __init__(self, rel, admin_site, attrs=None, using=None):
        attrs = {'class': 'form-control vManyToManyRawIdAdminField', **(attrs or {})}
        get_original(ForeignKeyRawIdWidget)(self, rel, admin_site, attrs=attrs, using=using)

    def get_context(self, name, value, attrs):
        return super().get_context(name, value, attrs)

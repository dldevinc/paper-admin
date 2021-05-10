import json

from django.forms import widgets
from django.contrib.admin.widgets import AutocompleteMixin as DefaultAutocompleteMixin
from django.contrib.admin.widgets import ForeignKeyRawIdWidget, ManyToManyRawIdWidget

from ..monkey_patch import MonkeyPatchMeta, get_original


# Метакласс MonkeyPatch для класса Widget.
WidgetMonkeyPatchMeta = type("WidgetMonkeyPatchMeta", (MonkeyPatchMeta, widgets.MediaDefiningClass, ), {})


class PatchInput(widgets.Input, metaclass=WidgetMonkeyPatchMeta):
    def __init__(self, attrs=None):
        default_attrs = {
            "class": "form-control form-control-lg"
        }
        if attrs:
            default_attrs.update(attrs)
        get_original(widgets.Input)(self, attrs=default_attrs)


class PatchTextarea(widgets.Textarea, metaclass=WidgetMonkeyPatchMeta):
    def __init__(self, attrs=None):
        default_attrs = {
            "class": "form-control form-control-lg"
        }
        if attrs:
            default_attrs.update(attrs)
        get_original(widgets.Textarea)(self, attrs=default_attrs)


class PatchManyToManyRawIdWidget(ManyToManyRawIdWidget, metaclass=WidgetMonkeyPatchMeta):
    def __init__(self, rel, admin_site, attrs=None, using=None):
        get_original(ManyToManyRawIdWidget)(self, rel, admin_site, attrs=attrs, using=using)
        self.attrs["class"] = (self.attrs.get("class", "") + " vManyToManyRawIdAdminField").strip()

    def get_context(self, name, value, attrs):
        # удаление хардкода CSS-класса
        return super().get_context(name, value, attrs)


class AdminIPInput(widgets.TextInput):
    template_name = "django/forms/widgets/ip.html"


class AdminUUIDInput(widgets.TextInput):
    template_name = "django/forms/widgets/uuid.html"


class AdminSwitchInput(widgets.CheckboxInput):
    template_name = "django/forms/widgets/switch.html"

    def __init__(self, attrs=None):
        attrs = attrs or {}
        attrs.setdefault("class", "custom-control-input")
        super().__init__(attrs=attrs)


class AdminTextarea(widgets.Textarea):
    def __init__(self, attrs=None):
        default_attrs = {
            "rows": "3",
        }
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)


class AdminForeignKeyRawIdWidget(ForeignKeyRawIdWidget):
    template_name = "django/forms/widgets/foreign_key_raw_id.html"


class AdminManyToManyRawIdWidget(ManyToManyRawIdWidget):
    template_name = "django/forms/widgets/many_to_many_raw_id.html"


class AdminCheckboxInput(widgets.CheckboxInput):
    template_name = "django/forms/widgets/checkbox_custom.html"

    def __init__(self, attrs=None, check_test=None):
        attrs = attrs or {}
        attrs.setdefault("class", "custom-control-input")
        super().__init__(attrs=attrs, check_test=check_test)


class AdminRadioSelect(widgets.RadioSelect):
    template_name = "django/forms/widgets/radio_custom.html"
    option_template_name = "django/forms/widgets/radio_option_custom.html"

    def __init__(self, attrs=None, choices=()):
        attrs = attrs or {}
        attrs.setdefault("class", "custom-control-input")
        super().__init__(attrs=attrs, choices=choices)


class AdminCheckboxSelectMultiple(widgets.CheckboxSelectMultiple):
    template_name = "django/forms/widgets/checkbox_select.html"
    option_template_name = "django/forms/widgets/checkbox_custom.html"

    def __init__(self, attrs=None, choices=()):
        attrs = attrs or {}
        attrs.setdefault("class", "custom-control-input")
        super().__init__(attrs=attrs, choices=choices)


class AdminSelectMultiple(widgets.SelectMultiple):
    # TODO: использовать другой плагин
    template_name = "django/forms/widgets/select_multiple.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context["widget"]["attrs"]["class"] = "vMultiSelect"
        return context


class AutocompleteMixin(DefaultAutocompleteMixin):
    @property
    def media(self):
        return widgets.Media()

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


class AutocompleteSelect(AutocompleteMixin, widgets.Select):
    pass


class AutocompleteSelectMultiple(AutocompleteMixin, widgets.SelectMultiple):
    pass

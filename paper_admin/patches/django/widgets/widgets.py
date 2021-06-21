import json

from django.contrib.admin.widgets import AutocompleteMixin as AutocompleteMixin
from django.contrib.admin.widgets import ManyToManyRawIdWidget
from django.forms import widgets

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

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


class PatchSelect(widgets.Select, metaclass=WidgetMonkeyPatchMeta):
    def __init__(self, attrs=None, choices=()):
        default_attrs = {
            "class": "custom-select custom-select-lg"
        }
        if attrs:
            default_attrs.update(attrs)
        get_original(widgets.Select)(self, attrs=default_attrs, choices=choices)


class PatchTextarea(widgets.Textarea, metaclass=WidgetMonkeyPatchMeta):
    def __init__(self, attrs=None):
        default_attrs = {
            "class": "form-control form-control-lg"
        }
        if attrs:
            default_attrs.update(attrs)
        get_original(widgets.Textarea)(self, attrs=default_attrs)


class PatchSelectDateWidget(widgets.SelectDateWidget, metaclass=WidgetMonkeyPatchMeta):
    def get_context(self, name, value, attrs):
        # disable select2 allowClear
        attrs = attrs or {}
        attrs.setdefault("data-allow-clear", "false")
        return get_original(widgets.SelectDateWidget)(self, name, value, attrs)


class PatchManyToManyRawIdWidget(ManyToManyRawIdWidget, metaclass=WidgetMonkeyPatchMeta):
    def __init__(self, rel, admin_site, attrs=None, using=None):
        get_original(ManyToManyRawIdWidget)(self, rel, admin_site, attrs=attrs, using=using)
        self.attrs["class"] = (self.attrs.get("class", "") + " vManyToManyRawIdAdminField").strip()

    def get_context(self, name, value, attrs):
        # удаление CSS-класса
        return super().get_context(name, value, attrs)


class PatchAutocompleteMixin(AutocompleteMixin, metaclass=MonkeyPatchMeta):
    def __init__(self, rel, admin_site, attrs=None, choices=(), using=None):
        default_attrs = {
            "class": "custom-select custom-select-lg"
        }
        if attrs:
            default_attrs.update(attrs)
        get_original(AutocompleteMixin)(self, rel, admin_site, attrs=default_attrs, choices=choices, using=using)

    @property
    def media(self):
        return widgets.Media()

    def build_attrs(self, base_attrs, extra_attrs=None):
        attrs = super().build_attrs(base_attrs, extra_attrs=extra_attrs)
        attrs.setdefault("class", "")
        attrs.update({
            "data-width": "",
            "data-ajax--cache": "true",
            "data-ajax--type": "GET",
            "data-ajax--url": self.get_url(),
            "data-allow-clear": json.dumps(not self.is_required),
            "data-placeholder": "",  # Allows clearing of the input.
            "class": attrs["class"] + (" " if attrs["class"] else "") + "admin-autocomplete",
        })
        return attrs

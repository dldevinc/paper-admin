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
        # удаление CSS-класса
        return super().get_context(name, value, attrs)


class PatchAutocompleteMixin(AutocompleteMixin, metaclass=MonkeyPatchMeta):
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

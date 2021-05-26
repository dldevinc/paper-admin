from django.forms import widgets
from post_office.admin import CommaSeparatedEmailWidget

from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса Widget.
WidgetMonkeyPatchMeta = type("WidgetMonkeyPatchMeta", (MonkeyPatchMeta, widgets.MediaDefiningClass, ), {})


class PatchCommaSeparatedEmailWidget(CommaSeparatedEmailWidget, metaclass=WidgetMonkeyPatchMeta):
    # Добавление CSS-класса "vTextField", но без перезаписи всего атрибута "class".
    def __init__(self, attrs=None):
        attrs = attrs or {}
        classes = attrs.get("class", "") or ""
        classes = (classes + " vTextField").strip()
        attrs["class"] = classes
        super().__init__(attrs=attrs)

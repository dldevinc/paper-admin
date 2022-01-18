from django.forms import widgets
from post_office.admin import CommaSeparatedEmailWidget

from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса Widget.
WidgetMonkeyPatchMeta = type("WidgetMonkeyPatchMeta", (MonkeyPatchMeta, widgets.MediaDefiningClass, ), {})


class PatchCommaSeparatedEmailWidget(CommaSeparatedEmailWidget, metaclass=WidgetMonkeyPatchMeta):
    # В оригинальном классе атрибут "class" полностью переопределяется через `.update()`.
    # Из-за этого стираются классы, назначенные с помощью патчей виджетов Django.
    # Этот класс удаляет CSS-класс "vTextField", т.к. в paper-admin он не нужен.

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

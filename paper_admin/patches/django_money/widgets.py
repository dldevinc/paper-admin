from djmoney.forms.widgets import MoneyWidget
from django.forms import widgets

from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса Widget.
WidgetMonkeyPatchMeta = type("WidgetMonkeyPatchMeta", (MonkeyPatchMeta, widgets.MediaDefiningClass, ), {})


class PatchMoneyWidgetMixin(MoneyWidget, metaclass=WidgetMonkeyPatchMeta):
    template_name = "paper_django_money/widget.html"

    @property
    def media(self):
        return widgets.Media(
            css={
                "all": (
                    "paper_django_money/widget.css",
                )
            },
        )

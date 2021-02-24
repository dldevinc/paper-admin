from django.apps import AppConfig


class Config(AppConfig):
    name = "paper_admin.patches.dal"
    label = "paper_dal"

    def ready(self):
        from dal_select2.widgets import Select2WidgetMixin
        from ...monkey_patch import extend_class
        from . import widgets

        extend_class(Select2WidgetMixin, widgets.Select2WidgetMixin)

from django.apps import AppConfig


class Config(AppConfig):
    name = "paper_admin.patches.dal"
    label = "paper_dal"

    def ready(self):
        from . import widgets

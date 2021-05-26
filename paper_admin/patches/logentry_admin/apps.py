from django.apps import AppConfig


class Config(AppConfig):
    name = "paper_admin.patches.logentry_admin"
    label = "paper_logentry_admin"

    def ready(self):
        from . import admin

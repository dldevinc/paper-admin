from django.apps import AppConfig


class Config(AppConfig):
    name = "paper_admin.patches.post_office"
    label = "paper_post_office"

    def ready(self):
        from . import admin

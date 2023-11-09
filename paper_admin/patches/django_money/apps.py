from django.apps import AppConfig


class Config(AppConfig):
    name = "paper_admin.patches.django_money"
    label = "paper_django_money"

    def ready(self):
        from . import widgets

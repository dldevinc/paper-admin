from django.apps import AppConfig


class Config(AppConfig):
    name = "paper_admin.patches.tree_queries"
    label = "paper_tree_queries"

    def ready(self):
        from . import forms

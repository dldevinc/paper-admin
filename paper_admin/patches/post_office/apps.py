from django.apps import AppConfig
from django.forms import widgets


def _init_widget(self, *args, **kwargs):
    # rollback adding "vTextField" CSS-class
    super(widgets.TextInput, self).__init__(*args, **kwargs)


class Config(AppConfig):
    name = "paper_admin.patches.post_office"
    label = "paper_post_office"

    def ready(self):
        from post_office.admin import CommaSeparatedEmailWidget

        CommaSeparatedEmailWidget.__init__ = _init_widget

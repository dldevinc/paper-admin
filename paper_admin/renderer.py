from pathlib import Path
from django.utils.functional import cached_property
from django.template.backends.django import DjangoTemplates
from django.forms.renderers import EngineMixin, BaseRenderer

ROOT = Path(__file__).parent


class PaperFormRenderer(EngineMixin, BaseRenderer):
    backend = DjangoTemplates

    @cached_property
    def engine(self):
        return self.backend({
            'APP_DIRS': True,
            'DIRS': [str(ROOT / self.backend.app_dirname)],
            'NAME': 'paperforms',
            'OPTIONS': {

            }
        })

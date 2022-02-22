from pathlib import Path

from django import forms
from django.forms.renderers import BaseRenderer, EngineMixin
from django.template.backends.django import DjangoTemplates
from django.utils.functional import cached_property

ROOT = Path(__file__).parent.parent


class PaperFormRenderer(EngineMixin, BaseRenderer):
    backend = DjangoTemplates  # TODO: support for Jinja2

    @cached_property
    def engine(self):
        return self.backend(
            {
                "APP_DIRS": True,
                "DIRS": [
                    str(ROOT / self.backend.app_dirname),
                    str(Path(forms.__file__).parent / self.backend.app_dirname)
                ],
                "NAME": "paperforms",
                "OPTIONS": {},
            }
        )

from django.db import models
from django.utils.translation import gettext_lazy as _
from solo.models import SingletonModel


class Sigleton(SingletonModel):
    title = models.CharField(_("title"), max_length=255)

    class Meta:
        verbose_name = _("singleton")

    def __str__(self):
        return self.title

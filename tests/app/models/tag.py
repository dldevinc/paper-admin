from django.db import models
from django.utils.translation import gettext_lazy as _


class Tag(models.Model):
    name = models.CharField(_("name"), max_length=128)

    class Meta:
        ordering = ["name"]
        verbose_name = _("Tag")

    def __str__(self):
        return self.name

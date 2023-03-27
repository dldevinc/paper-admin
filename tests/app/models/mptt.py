from django.db import models
from django.utils.translation import gettext_lazy as _
from mptt.models import MPTTModel, TreeForeignKey

HELP_TEXT = "Lorem ipsum <b>dolor</b> sit amet, consetetur sadipscing elitr, " \
            "sed diam nonumy eirmod tempor invidunt ut labore et dolore magna " \
            "aliquyam erat, sed diam voluptua"


class MPTTTree(MPTTModel):
    parent = TreeForeignKey("self", null=True, blank=True, related_name="children", on_delete=models.CASCADE)
    name = models.CharField(_("name"), max_length=128, help_text=HELP_TEXT)

    class Meta:
        verbose_name = _("MPTT")
        verbose_name_plural = _("MPTT")

    def __str__(self):
        return self.name

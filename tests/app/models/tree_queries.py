from django.db import models
from django.utils.translation import gettext_lazy as _
from tree_queries.models import TreeNode

HELP_TEXT = "Lorem ipsum <b>dolor</b> sit amet, consetetur sadipscing elitr, " \
            "sed diam nonumy eirmod tempor invidunt ut labore et dolore magna " \
            "aliquyam erat, sed diam voluptua"


class DjangoTreeQueriesNode(TreeNode):
    name = models.CharField(_("name"), max_length=128, help_text=HELP_TEXT)

    class Meta:
        verbose_name = _("Django Tree Queries")
        verbose_name_plural = _("Django Tree Queries")

    def __str__(self):
        return self.name

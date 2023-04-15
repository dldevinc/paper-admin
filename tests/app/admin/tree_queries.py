from django.contrib import admin

from paper_admin.patches.tree_queries.admin import TreeNodeModelAdmin

from ..models import DjangoTreeQueriesNode


@admin.register(DjangoTreeQueriesNode)
class DjangoTreeQueriesNodeAdmin(TreeNodeModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "parent", "name",
            ),
        }),
    )

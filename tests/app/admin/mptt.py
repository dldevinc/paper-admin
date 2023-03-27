from django.contrib import admin
from mptt.admin import MPTTModelAdmin

from ..models import MPTTTree


@admin.register(MPTTTree)
class MPTTTreeAdmin(MPTTModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "parent", "name",
            ),
        }),
    )

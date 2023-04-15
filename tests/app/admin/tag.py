from django.contrib import admin

from ..models import Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "name",
            ),
        }),
    )
    search_fields = ["name"]

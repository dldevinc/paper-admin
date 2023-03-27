from django.contrib import admin
from solo.admin import SingletonModelAdmin

from ..models import SigletonExample


@admin.register(SigletonExample)
class SigletonExampleAdmin(SingletonModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "title",
            ),
        }),
    )

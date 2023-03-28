from django.contrib import admin
from solo.admin import SingletonModelAdmin

from ..models import Sigleton


@admin.register(Sigleton)
class SigletonAdmin(SingletonModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "title",
            ),
        }),
    )

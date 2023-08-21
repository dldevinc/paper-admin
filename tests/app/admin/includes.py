from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from ..models import Person, Pet


class PetInline(admin.StackedInline):
    model = Pet
    extra = 0
    tab = "pets"


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "name", "email", "birthday",
            )
        }),
    )
    inlines = [PetInline]
    tabs = [
        ("general", _("General")),
        ("pets", _("Pets")),
    ]
    # form_includes = [
    #     ("app/includes/disclaimer.html", "top", "general"),
    #     ("app/includes/privacy_notice.html",),
    # ]

    def get_form_includes(self, request, obj=None):
        if request.user.is_superuser:
            return []

        return [
            ("app/includes/disclaimer.html", "top", "general"),
            ("app/includes/privacy_notice.html",),
        ]

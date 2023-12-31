from django.contrib import admin
from django.utils.text import Truncator
from django.utils.translation import gettext_lazy as _
from paper_admin.admin.filters import HierarchyFilter, SimpleListFilter

from ..models import Group, Message, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("name",)


class GroupFilter(HierarchyFilter):
    title = _("Group")
    parameter_name = "group"

    def lookups(self, changelist):
        return Group.objects.values_list("pk", "name")

    def queryset(self, request, queryset):
        value = self.value()
        if not value:
            return queryset

        return queryset.filter(group__in=value)


class RatingFilter(SimpleListFilter):
    title = "Rating"
    parameter_name = "rating"

    def lookups(self, request, model_admin):
        return [
            ("good", _("Good")),
            ("bad", _("Bad")),
            ("unknown", _("Unknown")),
        ]

    def queryset(self, request, queryset):
        value = self.value()
        if "good" in value:
            return queryset.filter(
                rating__gte=3
            )
        if "bad" in value:
            return queryset.filter(
                rating__lt=3,
                rating__gt=0
            )
        if "unknown" in value:
            return queryset.filter(
                rating=0
            )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    search_fields = ["text"]
    actions_on_bottom = True
    list_display = ("sender", "group", "type", "rating", "text_display", "created_at")
    list_filter = (GroupFilter, "type", "sender", RatingFilter, "edited", "created_at")
    date_hierarchy = "created_at"
    ordering = ("created_at",)

    def text_display(self, obj):
        return Truncator(obj.text).chars(40)
    text_display.short_description = _("Text")

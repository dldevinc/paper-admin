from django.contrib import admin
from django.utils.text import Truncator
from django.utils.translation import gettext_lazy as _
from paper_admin.admin.filters import HierarchyFilter

from ..models import Group, Message, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("name",)


class GroupFilter(HierarchyFilter):
    title = _("Filter by group")
    parameter_name = "group"

    def lookups(self, changelist):
        return (
            (pk, name)
            for pk, name in Group.objects.values_list("pk", "name")
        )

    def queryset(self, request, queryset):
        value = self.value()
        if not value:
            return queryset

        return queryset.filter(group__in=value)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    search_fields = ["text"]
    actions_on_bottom = True
    list_display = ("sender", "group", "type", "text_display", "created_at")
    list_filter = (GroupFilter, "type", "sender", "created_at")
    date_hierarchy = "created_at"
    ordering = ("created_at",)

    def text_display(self, obj):
        return Truncator(obj.text).chars(40)
    text_display.short_description = _("Text")

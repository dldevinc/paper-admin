from django.contrib import admin

from ..models import Group, Message, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    search_fields = ["text"]
    actions_on_bottom = True
    list_display = ("sender", "group", "type", "text", "created_at")
    list_filter = ("type", "sender", "created_at")
    date_hierarchy = "created_at"
    ordering = ("created_at",)

from django.contrib import admin
from django.contrib.admin.models import LogEntry
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import ugettext_lazy as _


@admin.register(LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    fieldsets = (
        (_('Object'), {
            'fields': (
                'content_type_display', 'object_link',
            ),
        }),
        (_('Action'), {
            'fields': (
                'change_message_display',
            ),
        }),
        (_('Information'), {
            'fields': (
                'user_link', 'action_time'
            ),
        }),
    )
    date_hierarchy = 'action_time'
    search_fields = ['object_repr', 'change_message']
    list_filter = ['action_flag', 'user']
    list_display = [
        'action_time', 'content_type_display', 'object_link', 'user_link',
        'action_flag_display'
    ]
    readonly_fields = (
        'content_type_display', 'object_link', 'action_time', 'change_message',
        'change_message_display', 'user_link'
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def content_type_display(self, obj):
        return '{}.{}'.format(
            obj.content_type.app_label,
            obj.content_type.model
        )
    content_type_display.admin_order_field = 'content_type'
    content_type_display.short_description = _('Content type')

    def object_link(self, obj):
        info = obj.content_type.app_label, obj.content_type.model
        url = reverse('admin:{}_{}_change'.format(*info), args=[obj.object_id])
        return format_html(
            '<a href="{}">{}</a> (#{})',
            url,
            obj.object_repr,
            obj.object_id
        )
    object_link.admin_order_field = 'object_link'
    object_link.short_description = _('Object')

    def user_link(self, obj):
        user_model = type(obj.user)
        info = user_model._meta.app_label, user_model._meta.model_name
        url = reverse('admin:{}_{}_change'.format(*info), args=[obj.user_id])
        return format_html(
            '<a href="{}">{}</a>',
            url,
            str(obj.user)
        )
    user_link.admin_order_field = 'user'
    user_link.short_description = _('user')

    def action_flag_display(self, obj):
        return obj.get_action_flag_display()
    action_flag_display.short_description = _('action')

    def change_message_display(self, obj):
        return obj.get_change_message()
    change_message_display.short_description = _('Change message')

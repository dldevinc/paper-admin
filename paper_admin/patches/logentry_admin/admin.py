from django import forms
from logentry_admin.admin import LogEntryAdmin

from paper_admin.admin.filters import RelatedOnlyFieldListFilter
from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class PatchLogEntryAdmin(LogEntryAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    object_history = False
    list_filter = [
        ('user', RelatedOnlyFieldListFilter),
        ('content_type', RelatedOnlyFieldListFilter),
        'action_flag'
    ]
    list_display = [
        'action_time',
        'user_link',
        'content_type',
        'object_link',
        'action_description',
    ]
    list_display_links = [
        'action_time',
    ]

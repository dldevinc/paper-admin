from django import forms
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _
from logentry_admin.admin import LogEntryAdmin

from paper_admin.admin.filters import SimpleListFilter
from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class ContentTypeListFilter(SimpleListFilter):
    title = _('content type')
    parameter_name = 'content_type'
    template = "paper_admin/filters/select.html"

    def lookups(self, request, model_admin):
        return (
            (ct.id, "{}.{}".format(ct.app_label, ct.model))
            for ct in ContentType.objects.order_by("app_label", "model")
        )

    def queryset(self, request, queryset):
        if self.value():
            queryset = queryset.filter(content_type__in=self.value())
        return queryset


class PatchLogEntryAdmin(LogEntryAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    object_history = False
    list_filter = [
        'user',
        ContentTypeListFilter,
        'action_flag'
    ]

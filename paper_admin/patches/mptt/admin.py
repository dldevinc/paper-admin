from django import forms
from django.urls import reverse
from mptt.admin import MPTTModelAdmin

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class PatchMPTTModelAdmin(MPTTModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    """
    Фиксы для MPTTModelAdmin.

    https://github.com/darklow/django-suit/issues/381
    """
    list_per_page = 2000
    mptt_level_indent = 12

    def get_changelist(self, request, **kwargs):
        base_changelist_class = get_original(MPTTModelAdmin)(self, request, **kwargs)

        class ChangeList(base_changelist_class):
            def get_ordering(self, request, queryset):
                ordering = super().get_ordering(request, queryset) or []

                if self.sortable_allowed:
                    mptt_opts = self.model._mptt_meta
                    ordering = [mptt_opts.tree_id_attr, mptt_opts.left_attr] + ordering

                return ordering

        return ChangeList

    def _set_order(self, order_dict):
        get_original(MPTTModelAdmin)(self, order_dict)
        self.model._default_manager.rebuild()

    def is_bulk_edit(self, request):
        changelist_url = "admin:%(app_label)s_%(model_name)s_changelist" % {
            "app_label": self.model._meta.app_label,
            "model_name": self.model._meta.model_name,
        }
        return (
            request.path == reverse(changelist_url)
            and request.method == "POST"
            and "_save" in request.POST
        )

    def save_model(self, request, obj, form, change):
        get_original(MPTTModelAdmin)(self, request, obj, form, change)
        if not self.is_bulk_edit(request):
            self.model._default_manager.rebuild()

    def changelist_view(self, request, extra_context=None):
        response = get_original(MPTTModelAdmin)(self, request, extra_context)
        if self.is_bulk_edit(request):
            self.model._default_manager.rebuild()
        return response

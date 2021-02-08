import sys

from django.urls import reverse

from paper_admin.admin.sortable import SortableAdminMixin


class SortableMPTTModelAdmin(SortableAdminMixin):
    """
    Фиксы для MPTTModelAdmin.

    https://github.com/darklow/django-suit/issues/381
    """
    list_per_page = sys.maxsize
    mptt_indent_field = "__str__"   # default for mptt
    mptt_level_indent = 14

    def get_ordering(self, request):
        mptt_opts = self.model._mptt_meta
        return mptt_opts.tree_id_attr, mptt_opts.left_attr, self.sortable

    def _update_order(self, reorder_dict):
        super()._update_order(reorder_dict)
        self.model._default_manager.rebuild()

    def is_bulk_edit(self, request):
        changelist_url = "admin:%(app_label)s_%(model_name)s_changelist" % {
            "app_label": self.model._meta.app_label,
            "model_name": self.model._meta.model_name,
        }
        return (request.path == reverse(changelist_url) and
                request.method == "POST" and "_save" in request.POST)

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if not self.is_bulk_edit(request):
            self.model._default_manager.rebuild()

    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context)
        if self.is_bulk_edit(request):
            self.model._default_manager.rebuild()
        return response

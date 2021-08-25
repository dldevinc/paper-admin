from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _


class TreeNodeModelAdminMixin:
    """
    Некоторые аспекты взяты из MPTTModelAdmin.
    """
    change_list_template = "admin/tree_queries_change_list.html"
    list_per_page = 2000  # This will take a really long time to load.
    list_display = ["indented_title"]  # Sane defaults.
    list_display_links = ["indented_title"]  # Sane defaults.
    tree_queries_level_indent = 12

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.with_tree_fields()

    def indented_title(self, obj):
        return format_html(
            '<div style="text-indent:{}px">{}</div>',
            obj.tree_depth * self.tree_queries_level_indent,
            obj
        )

    indented_title.short_description = _("title")


class TreeNodeModelAdmin(TreeNodeModelAdminMixin, admin.ModelAdmin):
    pass

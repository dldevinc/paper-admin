from django.template import Library, loader

from paper_admin.templatetags.paper_list import (
    ResultRow,
    ResultTable,
    result_list_context,
)

register = Library()


class TreeQueriesResultRow(ResultRow):
    def build_attrs(self):
        attrs = super().build_attrs()
        if self.cl.sortable_allowed:
            attrs["data-parent"] = getattr(self.obj, "parent_id") or 0
        return attrs


class TreeQueriesResultTable(ResultTable):
    row_class = TreeQueriesResultRow


@register.simple_tag(takes_context=True)
def paper_tree_queries_list(context, cl):
    request = context.get("request")
    if request is None:
        return ""

    table = TreeQueriesResultTable(request, cl)
    context = result_list_context(table)
    return loader.render_to_string("admin/tree_queries_change_list_results.html", context, request=request)

from django.template import Library, loader
from mptt.templatetags.mptt_admin import mptt_items_for_result

from paper_admin.templatetags.paper_list import (
    ResultRow,
    ResultTable,
    result_list_context,
)

register = Library()


class MPTTResultRow(ResultRow):
    def __iter__(self):
        yield from mptt_items_for_result(self.cl, self.obj, self.form)

    def build_attrs(self):
        attrs = super().build_attrs()
        if self.cl.sortable_allowed:
            attrs["data-parent"] = getattr(self.obj, self.obj._mptt_meta.parent_attr + "_id") or 0
        return attrs


class MPTTResultTable(ResultTable):
    row_class = MPTTResultRow


@register.simple_tag(takes_context=True)
def paper_mptt_result_list(context, cl):
    request = context.get("request")
    if request is None:
        return ""

    table = MPTTResultTable(request, cl)
    context = result_list_context(table)
    return loader.render_to_string("admin/mptt_change_list_results.html", context, request=request)

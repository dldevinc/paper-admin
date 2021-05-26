from django.contrib.admin.templatetags import admin_list
from django.forms.utils import flatatt
from django.template import Library, loader
from django.utils.functional import cached_property

register = Library()


class ResultRow:
    def __init__(self, request, cl, obj, form=None):
        self.request = request
        self.cl = cl
        self.obj = obj
        self.form = form

    def __iter__(self):
        yield from admin_list.items_for_result(self.cl, self.obj, self.form)

    @property
    def model_admin(self):
        return self.cl.model_admin

    def has_add_permission(self):
        # для changelist_tools
        return self.model_admin.has_add_permission(self.request)

    def has_view_permission(self):
        # для changelist_tools
        return self.model_admin.has_view_permission(self.request, self.obj)

    def has_change_permission(self):
        # для changelist_tools
        return self.model_admin.has_change_permission(self.request, self.obj)

    def has_delete_permission(self):
        # для changelist_tools
        return self.model_admin.has_delete_permission(self.request, self.obj)

    def build_attrs(self):
        if self.cl.sortable_allowed:
            return {
                "data-id": self.obj.pk,
                "data-order-value": getattr(self.obj, self.model_admin.sortable, 0)
            }
        return {}

    def attrs(self):
        return flatatt(self.build_attrs() or {})


class ResultTable:
    row_class = ResultRow

    def __init__(self, request, cl):
        self.request = request
        self.cl = cl
        self.headers = list(admin_list.result_headers(cl))
        self.hidden_fields = list(admin_list.result_hidden_fields(cl))

    @property
    def model_admin(self):
        return self.cl.model_admin

    @cached_property
    def num_sorted_fields(self):
        num_sorted_fields = 0
        for h in self.headers:
            if h["sortable"] and h["sorted"]:
                num_sorted_fields += 1

        return num_sorted_fields

    @cached_property
    def column_count(self):
        num_columns = len(self.headers)

        if self.model_admin.sortable:
            num_columns += 1

        if self.model_admin.changelist_tools:
            num_columns += 1

        return num_columns

    def __iter__(self):
        if self.cl.formset:
            for res, form in zip(self.cl.result_list, self.cl.formset.forms):
                yield self.row_class(self.request, self.cl, res, form)
        else:
            for res in self.cl.result_list:
                yield self.row_class(self.request, self.cl, res)


def result_list_context(table):
    return {
        "cl": table.cl,
        "result_hidden_fields": table.hidden_fields,
        "result_headers": table.headers,
        "num_sorted_fields": table.num_sorted_fields,
        "results": table,

        "column_count": table.column_count,
        "current_page": table.cl.paginator.page(table.cl.page_num + 1),
    }


@register.simple_tag(takes_context=True)
def paper_result_list(context, cl):
    request = context.get("request")
    if request is None:
        return ""

    table = ResultTable(request, cl)
    context = result_list_context(table)
    return loader.render_to_string("admin/change_list_results.html", context, request=request)

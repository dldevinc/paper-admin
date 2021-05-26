from django.contrib.admin.templatetags import admin_list
from django.forms.utils import flatatt
from django.template import Library

register = Library()


class ResultList(admin_list.ResultList):
    def __init__(self, cl, obj, form, items, attrs=None):
        self.obj = obj

        self.attrs = {
            "data-id": obj.pk
        }
        if cl.sortable_allowed:
            self.attrs["data-order-value"] = getattr(obj, cl.model_admin.sortable, 0)

        self.attrs.update(attrs or {})

        self.has_add_permission = cl.model_admin.has_add_permission(cl.request)
        self.has_view_permission = cl.model_admin.has_view_permission(cl.request, obj)
        self.has_change_permission = cl.model_admin.has_change_permission(cl.request, obj)
        self.has_delete_permission = cl.model_admin.has_delete_permission(cl.request, obj)

        super().__init__(form, items)

    @property
    def row_attrs(self):
        return flatatt(self.attrs or {})


def results(cl):
    if cl.formset:
        for res, form in zip(cl.result_list, cl.formset.forms):
            items = admin_list.items_for_result(cl, res, form)
            yield ResultList(cl, res, form, items)
    else:
        for res in cl.result_list:
            items = admin_list.items_for_result(cl, res, None)
            yield ResultList(cl, res, None, items)


@register.inclusion_tag("admin/change_list_results.html", takes_context=True)
def paper_result_list(context, cl):
    headers = list(admin_list.result_headers(cl))
    num_sorted_fields = 0
    for h in headers:
        if h["sortable"] and h["sorted"]:
            num_sorted_fields += 1

    num_columns = len(headers)
    if cl.model_admin.sortable:
        num_columns += 1
    if cl.model_admin.changelist_tools:
        num_columns += 1

    return {
        "request": context.get("request"),
        "cl": cl,
        "current_page": cl.paginator.page(cl.page_num + 1),
        "result_hidden_fields": list(admin_list.result_hidden_fields(cl)),
        "result_headers": headers,
        "num_columns": num_columns,
        "num_sorted_fields": num_sorted_fields,
        "results": results(cl),
    }

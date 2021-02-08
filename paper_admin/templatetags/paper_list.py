from django.contrib.admin.templatetags import admin_list
from django.contrib.admin.views.main import ALL_VAR, ORDER_TYPE_VAR, ORDER_VAR, SEARCH_VAR
from django.forms.utils import flatatt
from django.template import Library
from django.template.loader import get_template

FILTER_KEEP_PARAMS = {ALL_VAR, ORDER_VAR, ORDER_TYPE_VAR, SEARCH_VAR}
register = Library()


class ResultList(admin_list.ResultList):
    def __init__(self, cl, obj, form, items, attrs=None):
        self.obj = obj
        self.attrs = {
            "data-id": obj.pk
        }
        self.attrs.update(attrs or {})
        self.has_add_permission = cl.model_admin.has_add_permission(cl.request)
        self.has_view_permission = cl.model_admin.has_view_permission(cl.request, obj)
        self.has_change_permission = cl.model_admin.has_change_permission(cl.request, obj)
        self.has_delete_permission = cl.model_admin.has_delete_permission(cl.request, obj)

        if hasattr(cl.model_admin, "get_row_classes"):
            self.row_classes = " ".join(map(str,
                filter(bool, cl.model_admin.get_row_classes(cl.request, obj) or [])
            ))
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


@register.inclusion_tag("admin/change_list_results.html")
def paper_result_list(cl):
    headers = list(admin_list.result_headers(cl))
    num_sorted_fields = 0
    for h in headers:
        if h["sortable"] and h["sorted"]:
            num_sorted_fields += 1
    return {"cl": cl,
            "result_hidden_fields": list(admin_list.result_hidden_fields(cl)),
            "result_headers": headers,
            "num_sorted_fields": num_sorted_fields,
            "results": results(cl)}


@register.simple_tag
def paper_filter(cl, spec):
    tpl = get_template(spec.template)
    return tpl.render({
        "title": spec.title,
        "choices": list(spec.choices(cl)),
        "spec": spec,
    })


@register.simple_tag(takes_context=True)
def get_filter_keep_params(context):
    request = context.get("request")
    if request is None:
        return ""

    params = {}
    for key in FILTER_KEEP_PARAMS:
        if key in request.GET:
            params[key] = request.GET.get(key)
    return params.items()

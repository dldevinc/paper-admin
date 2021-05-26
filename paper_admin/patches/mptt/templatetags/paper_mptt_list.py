from django.contrib.admin.templatetags import admin_list
from django.template import Library
from mptt.templatetags.mptt_admin import mptt_items_for_result

from paper_admin.templatetags import paper_list

register = Library()


def mptt_results(cl):
    if cl.formset:
        for res, form in zip(cl.result_list, cl.formset.forms):
            items = mptt_items_for_result(cl, res, form)
            yield paper_list.ResultList(
                cl,
                res,
                form,
                items,
                attrs={
                    "data-parent": getattr(res, res._mptt_meta.parent_attr + "_id") or 0
                },
            )
    else:
        for res in cl.result_list:
            items = mptt_items_for_result(cl, res, None)
            yield paper_list.ResultList(
                cl,
                res,
                None,
                items,
                attrs={
                    "data-parent": getattr(res, res._mptt_meta.parent_attr + "_id") or 0
                },
            )


@register.inclusion_tag("admin/mptt_change_list_results.html", takes_context=True)
def paper_mptt_result_list(context, cl):
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
        "results": list(mptt_results(cl)),
    }

from django.contrib.admin.views.main import ALL_VAR, ORDER_TYPE_VAR, ORDER_VAR, SEARCH_VAR
from django.template import Library
from django.template.loader import get_template

FILTER_KEEP_PARAMS = {ALL_VAR, ORDER_VAR, ORDER_TYPE_VAR, SEARCH_VAR}
register = Library()


@register.simple_tag
def paper_list_filter(cl, spec):
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

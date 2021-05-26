from django.template import Library
from django.utils.html import escape

register = Library()


@register.simple_tag(takes_context=True)
def paper_row_classes(context, row, model_admin):
    request = context.get("request")
    if request is None:
        return ""

    classes = []
    if hasattr(model_admin, "get_row_classes"):
        classes.extend(model_admin.get_row_classes(request, row.obj))

    return " ".join(map(escape, filter(bool, classes)))


@register.simple_tag(takes_context=True)
def paper_form_classes(context, inline_form):
    request = context.get("request")
    if request is None:
        return ""

    classes = []
    model_admin = inline_form.model_admin
    if hasattr(model_admin, "get_form_classes"):
        classes.extend(model_admin.get_form_classes(request, inline_form.form.instance))

    return " ".join(map(escape, filter(bool, classes)))

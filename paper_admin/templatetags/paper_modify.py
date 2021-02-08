import json

from django.contrib.admin.templatetags.base import InclusionAdminNode
from django.template import Library

register = Library()


def prepopulated_fields_js(context):
    """
    Create a list of prepopulated_fields that should render Javascript for
    the prepopulated fields for both the admin form and inlines.
    """
    prepopulated_fields = []
    if "adminform" in context:
        prepopulated_fields.extend(context["adminform"].prepopulated_fields)
    if "inline_admin_formsets" in context:
        for inline_admin_formset in context["inline_admin_formsets"]:
            for inline_admin_form in inline_admin_formset:
                prepopulated_fields.extend(inline_admin_form.prepopulated_fields)

    prepopulated_fields_json = []
    for field in prepopulated_fields:
        prepopulated_fields_json.append({
            "id": field["field"].auto_id,
            "name": field["field"].name,
            "dependency_ids": [dependency.auto_id for dependency in field["dependencies"]],
            "dependency_list": [dependency.name for dependency in field["dependencies"]],
            "maxLength": field["field"].field.max_length or 50,
            "allowUnicode": getattr(field["field"].field, "allow_unicode", False)
        })

    context.update({
        "prepopulated_fields_json": json.dumps(prepopulated_fields_json),
    })
    return context


@register.tag(name="prepopulated_fields_js")
def prepopulated_fields_js_tag(parser, token):
    return InclusionAdminNode(parser, token, func=prepopulated_fields_js, template_name="prepopulated_fields_js.html")

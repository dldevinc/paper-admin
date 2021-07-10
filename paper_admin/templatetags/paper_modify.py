import json

from django.contrib.admin.templatetags.base import InclusionAdminNode
from django.template import Library

register = Library()


def prepopulated_fields_js(context):
    """
    Create a list of prepopulated_fields that should render Javascript for
    the prepopulated fields for both the admin form and inlines.
    """
    prepopulated_fields = {}

    if "adminform" in context:
        adminform = context["adminform"]
        adminform_prepopulated_fields = {}
        for field_name, dependencies in adminform.prepopulated_fields.items():
            slug_field = adminform.form[field_name].field
            adminform_prepopulated_fields[field_name] = {
                "dependencies": dependencies,
                "maxLength": slug_field.max_length or 50,
                "allowUnicode": getattr(slug_field, "allow_unicode", False),
            }
        prepopulated_fields[""] = adminform_prepopulated_fields

    if "inline_admin_formsets" in context:
        for inline_admin_formset in context["inline_admin_formsets"]:
            inline_form = inline_admin_formset.formset.form
            inline_form_prepopulated_fields = {}
            for field_name, dependencies in inline_admin_formset.prepopulated_fields.items():
                slug_field = inline_form.base_fields[field_name]
                inline_form_prepopulated_fields[field_name] = {
                    "dependencies": dependencies,
                    "maxLength": slug_field.max_length or 50,
                    "allowUnicode": getattr(slug_field, "allow_unicode", False),
                }
            prepopulated_fields[inline_admin_formset.formset.prefix] = inline_form_prepopulated_fields

    context.update(
        {"prepopulated_fields_json": json.dumps(prepopulated_fields)}
    )
    return context


@register.tag(name="prepopulated_fields_js")
def prepopulated_fields_js_tag(parser, token):
    return InclusionAdminNode(
        parser,
        token,
        func=prepopulated_fields_js,
        template_name="prepopulated_fields_js.html",
    )

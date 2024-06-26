from django.contrib.admin.widgets import ForeignKeyRawIdWidget, ManyToManyRawIdWidget
from django.forms import widgets

__all__ = ["AdminIPInput", "AdminUUIDInput", "AdminSwitchInput", "AdminTextarea",
           "AdminForeignKeyRawIdWidget", "AdminManyToManyRawIdWidget", "AdminCheckboxInput",
           "AdminRadioSelect", "AdminCheckboxSelectMultiple", "FilteredSelectMultiple",
           "AdminCheckboxTree"]


class AdminIPInput(widgets.TextInput):
    template_name = "django/forms/widgets/ip.html"


class AdminUUIDInput(widgets.TextInput):
    template_name = "django/forms/widgets/uuid.html"


class AdminSwitchInput(widgets.CheckboxInput):
    template_name = "django/forms/widgets/switch.html"

    def __init__(self, attrs=None):
        attrs = attrs or {}
        attrs.setdefault("class", "custom-control-input")
        super().__init__(attrs=attrs)


class AdminTextarea(widgets.Textarea):
    def __init__(self, attrs=None):
        default_attrs = {
            "rows": "2",
        }
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)


class AdminForeignKeyRawIdWidget(ForeignKeyRawIdWidget):
    template_name = "django/forms/widgets/foreign_key_raw_id.html"


class AdminManyToManyRawIdWidget(ManyToManyRawIdWidget):
    template_name = "django/forms/widgets/many_to_many_raw_id.html"


class AdminCheckboxInput(widgets.CheckboxInput):
    template_name = "django/forms/widgets/checkbox_custom.html"

    def __init__(self, attrs=None, check_test=None):
        attrs = attrs or {}
        attrs.setdefault("class", "custom-control-input")
        super().__init__(attrs=attrs, check_test=check_test)


class AdminRadioSelect(widgets.RadioSelect):
    template_name = "django/forms/widgets/radio_custom.html"
    option_template_name = "django/forms/widgets/radio_option_custom.html"

    def __init__(self, attrs=None, choices=()):
        attrs = attrs or {}
        attrs.setdefault("class", "custom-control-input")
        super().__init__(attrs=attrs, choices=choices)


class AdminCheckboxSelectMultiple(widgets.CheckboxSelectMultiple):
    template_name = "django/forms/widgets/checkbox_select.html"
    option_template_name = "django/forms/widgets/checkbox_custom.html"

    def __init__(self, attrs=None, choices=()):
        attrs = attrs or {}
        attrs.setdefault("class", "custom-control-input")
        super().__init__(attrs=attrs, choices=choices)


class FilteredSelectMultiple(widgets.SelectMultiple):
    template_name = "django/forms/widgets/filtered_select_multiple.html"


class AdminCheckboxTree(widgets.SelectMultiple):
    template_name = "django/forms/widgets/checkbox_tree.html"

    def use_required_attribute(self, initial):
        # Don't use the 'required' attribute because browser validation would
        # require all checkboxes to be checked instead of at least one.
        return False

    def value_omitted_from_data(self, data, files, name):
        # HTML checkboxes don't appear in POST data if not checked, so it's
        # never known if the value is actually omitted.
        return False

from dal import autocomplete
from django import forms
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from paper_admin.admin.widgets import AdminCheckboxSelectMultiple, AdminSwitchInput

from ..models import Widgets


class WidgetsForm(forms.ModelForm):
    class Meta:
        model = Widgets
        fields = forms.ALL_FIELDS
        widgets = {
            "f_switch": AdminSwitchInput,
            "f_select_date": forms.SelectDateWidget,
            "f_password": forms.PasswordInput(render_value=True),
            "f_file_input": forms.FileInput,
            "f_hidden": forms.HiddenInput,
            "f_checkbox_m2m": AdminCheckboxSelectMultiple,
            "dal_fk": autocomplete.ModelSelect2(
                url="app:ac-tag"
            ),
            "dal_m2m": autocomplete.ModelSelect2Multiple(
                url="app:ac-tag"
            ),
        }


@admin.register(Widgets)
class WidgetsAdmin(admin.ModelAdmin):
    form = WidgetsForm
    fieldsets = (
        (_("Boolean"), {
            "tab": "standard-fields",
            "fields": (
                "f_boolean", "f_switch",
            )
        }),
        (_("Numeric"), {
            "tab": "standard-fields",
            "fields": (
                "f_small_int", "f_int", "f_bigint", "f_float", "f_decimal",
            )
        }),
        (_("Choices"), {
            "tab": "standard-fields",
            "fields": (
                "f_choices", "f_radio_choices",
            )
        }),
        (_("Date & Time"), {
            "tab": "standard-fields",
            "fields": (
                "f_date", "f_select_date", "f_time", "f_datetime", "f_duration",
            )
        }),
        (_("Text"), {
            "tab": "standard-fields",
            "fields": (
                "f_char", "f_slug", "f_email", "f_password", "f_ip", "f_text", "f_uuid", "f_url",
            )
        }),
        (_("Files"), {
            "tab": "standard-fields",
            "fields": (
                "f_filepath", "f_file", "f_file_input", "f_image",
            )
        }),
        (_("Read-only & Hidden"), {
            "tab": "standard-fields",
            "fields": (
                "f_char_ro", "f_int_ro", "f_text_ro", "f_hidden",
            )
        }),
        (_("Related"), {
            "tab": "related-fields",
            "fields": (
                "f_fk", "f_o2o", "f_radio_fk", "f_raw_id_fk",
            ),
        }),
        (_("Many-to-Many"), {
            "tab": "related-fields",
            "fields": (
                "f_m2m", "f_checkbox_m2m", "f_radio_m2m", "f_horizontal_m2m",
            ),
        }),
        (_("Autocomplete"), {
            "tab": "related-fields",
            "fields": (
                "f_ac_fk", "f_ac_o2o", "f_ac_m2m"
            ),
        }),
        (_("Django-autocomplete-light"), {
            "tab": "related-fields",
            "fields": (
                "dal_fk", "dal_m2m",
            )
        }),
    )
    tabs = [
        ("standard-fields", _("Standard Fields")),
        ("related-fields", _("Related Fields")),
    ]
    list_display = ["__str__", "f_int", "f_boolean", "f_choices"]
    list_editable = ["f_int", "f_boolean", "f_choices"]
    readonly_fields = ["f_char_ro", "f_int_ro", "f_text_ro"]
    autocomplete_fields = ["f_ac_fk", "f_ac_o2o", "f_ac_m2m"]
    raw_id_fields = ["f_raw_id_fk", "f_radio_m2m"]
    filter_horizontal = ["f_horizontal_m2m"]
    prepopulated_fields = {
        "f_slug": ("f_char", "f_int"),
    }
    radio_fields = {
        "f_radio_choices": 1,
        "f_radio_fk": 1,
    }

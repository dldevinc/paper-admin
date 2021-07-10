from django import forms
from django.contrib.admin import helpers
from django.contrib.admin.options import InlineModelAdmin, ModelAdmin
from django.utils.safestring import mark_safe

from paper_admin.admin.renderers import PaperFormRenderer
from paper_admin.admin.widgets import AdminCheckboxInput
from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

checkbox = AdminCheckboxInput({
    "class": "action-select custom-control-input"
}, lambda value: False)

checkbox_toggle = AdminCheckboxInput({
    "id": "action-toggle"
}, lambda value: False)

# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class PatchModelAdmin(ModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    def get_form(self, *args, **kwargs):
        form = get_original(ModelAdmin)(self, *args, **kwargs)
        if form.default_renderer is None:
            form.default_renderer = PaperFormRenderer
        return form

    def get_changelist_form(self, *args, **kwargs):
        form = get_original(ModelAdmin)(self, *args, **kwargs)
        if form.default_renderer is None:
            form.default_renderer = PaperFormRenderer
        return form

    def action_checkbox(self, obj):
        return checkbox.render(
            name=helpers.ACTION_CHECKBOX_NAME,
            value=str(obj.pk),
            renderer=PaperFormRenderer(),
        )

    action_checkbox.short_description = mark_safe(
        checkbox_toggle.render(
            name="action-toggle",
            value="",
            renderer=PaperFormRenderer()
        )
    )


class PatchInlineModelAdmin(InlineModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    def get_formset(self, *args, **kwargs):
        form = type(self.form.__name__, (self.form,), {})
        if form.default_renderer is None:
            form.default_renderer = PaperFormRenderer
        kwargs.setdefault("form", form)
        return get_original(InlineModelAdmin)(self, *args, **kwargs)

from django import forms
from django.contrib.admin.options import InlineModelAdmin, ModelAdmin

from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class PatchModelAdmin(ModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    def get_row_classes(self, request, obj):
        return []


class PatchInlineModelAdmin(InlineModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    def get_form_classes(self, request, obj):
        return []

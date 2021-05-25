from django import forms
from django.contrib.admin.options import InlineModelAdmin, ModelAdmin
from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class PatchModelAdmin(ModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    def get_row_classes(self, request, obj):
        """
        Позволяет назначить CSS-классы для ряда таблицы changelist.

        :type request: django.core.handlers.wsgi.WSGIRequest
        :type obj: *
        :rtype: list of str
        """
        return []

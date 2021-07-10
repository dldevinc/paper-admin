import json

from django import forms
from django.contrib.admin.options import BaseModelAdmin, InlineModelAdmin, ModelAdmin
from django.db import models, router, transaction
from django.http import (
    HttpResponseBadRequest,
    HttpResponseForbidden,
    HttpResponseNotAllowed,
    JsonResponse,
)
from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class PatchBaseModelAdmin(BaseModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    sortable = None


class PatchInlineModelAdmin(InlineModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if self.sortable and db_field.name == self.sortable:
            kwargs["widget"] = forms.HiddenInput(attrs={
                "class": "paper-formset__order",
            })
        return get_original(InlineModelAdmin)(self, db_field, request, **kwargs)


class PatchModelAdmin(ModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    def __init__(self, model, admin_site):
        get_original(ModelAdmin)(self, model, admin_site)

        if self.sortable:
            # remove sortable field from `list_editable` list
            self.list_editable = self.list_editable or []
            if self.sortable in self.list_editable:
                self.list_editable = [
                    field
                    for field in self.list_editable
                    if field != self.sortable
                ]

            # add sortable field to `exclude` list
            self.exclude = self.exclude or []
            if self.sortable not in self.exclude:
                self.exclude = list(self.exclude) + [self.sortable]

    def get_sortable_by(self, request):
        if self.sortable and self.has_change_permission(request):
            return []
        else:
            return get_original(ModelAdmin)(self, request)

    def get_urls(self):
        urlpatterns = []
        if self.sortable:
            info = self.model._meta.app_label, self.model._meta.model_name
            urlpatterns.extend([
                path(
                    "set-order/",
                    self.admin_site.admin_view(self.set_order),
                    name="%s_%s_order" % info,
                )
            ])
        return urlpatterns + get_original(ModelAdmin)(self)

    def save_model(self, request, obj, form, change):
        if self.sortable and not change:
            order_value = self.model._default_manager.aggregate(
                max_order=models.Max(self.sortable)
            )["max_order"] or 0
            setattr(obj, self.sortable, order_value + 1)
        get_original(ModelAdmin)(self, request, obj, form, change)

    @csrf_exempt
    def set_order(self, request):
        if request.method != "POST":
            return HttpResponseNotAllowed("Must be a POST request")

        if not self.sortable:
            return HttpResponseForbidden("No sortable field")

        if not self.has_change_permission(request):
            return HttpResponseForbidden("Missing permissions to perform this request")

        try:
            body = json.loads(request.body.decode())
        except json.JSONDecodeError:
            return HttpResponseBadRequest("Invalid JSON")

        with transaction.atomic(using=router.db_for_write(self.model)):
            self._set_order(body)

        return JsonResponse({})

    def _set_order(self, order_dict):
        for pk, order in order_dict.items():
            self.model._default_manager.filter(pk=pk).update(**{
                self.sortable: order
            })

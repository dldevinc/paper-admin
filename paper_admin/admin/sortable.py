import json
from collections import Iterable
from functools import partial, update_wrapper

from django import forms
from django.contrib import admin
from django.contrib.contenttypes.admin import GenericStackedInline, GenericTabularInline
from django.core.exceptions import ImproperlyConfigured
from django.db import models, transaction
from django.http import (
    HttpResponseBadRequest,
    HttpResponseForbidden,
    HttpResponseNotAllowed,
    JsonResponse,
)
from django.urls import path
from django.utils.html import format_html
from django.views.decorators.csrf import csrf_exempt

from .changelist import SortableChangeListMixin


class SortableAdminBaseMixin:
    sortable = "order"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.sortable:
            raise ImproperlyConfigured("Class {0}.{1} must define `sortable` field".format(
                self.__module__, self.__class__.__qualname__
            ))
        else:
            self.sortable_field = self.model._meta.get_field(self.sortable)  # noqa: F821


class SortableInlineBaseMixin(SortableAdminBaseMixin):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ordering = [self.sortable]
        self.fields = self.fields or []
        if self.fields and self.sortable not in self.fields:
            self.fields = list(self.fields) + [self.sortable]

    def formfield_for_dbfield(self, db_field, **kwargs):
        if db_field.name == self.sortable:
            kwargs["widget"] = forms.HiddenInput(attrs={
                "class": "sortable-input",
            })
        return super().formfield_for_dbfield(db_field, **kwargs)  # noqa: F821


class SortableStackedInline(SortableInlineBaseMixin, admin.StackedInline):
    pass


class SortableGenericStackedInline(SortableInlineBaseMixin, GenericStackedInline):
    pass


class SortableTabularInline(SortableInlineBaseMixin, admin.TabularInline):
    pass


class SortableGenericTabularInline(SortableInlineBaseMixin, GenericTabularInline):
    pass


class SortableAdminMixin(SortableAdminBaseMixin):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.ordering:
            self.ordering = [self.sortable]

        if not self.list_display_links:
            self.list_display_links = (self.list_display[0],)

        self.list_editable = self.list_editable or []
        if self.sortable in self.list_editable:
            self.list_editable = [f for f in self.list_editable if f != self.sortable]

        self.exclude = self.exclude or []
        if self.sortable not in self.exclude:
            self.exclude += [self.sortable]

        self._add_sortable_field()

        self.list_display = ["_sortable_field"] + list(self.list_display)
        if isinstance(self.sortable_by, Iterable) and "_sortable_field" not in self.sortable_by:  # noqa: F821
            self.sortable_by += ["_sortable_field"]  # noqa: F821

    def _add_sortable_field(self):
        def func(model_admin, obj):
            return format_html('''
                <div class="sort-handler" data-order="{order}">
                    <i class="fa fa-fw fa-sort"></i>
                </div>
            '''.strip(),
                order=getattr(obj, self.sortable)
            )

        setattr(func, "short_description", self.sortable_field.verbose_name)
        setattr(func, "admin_order_field", self.sortable)
        partial_func = partial(func, self)
        partial_func = update_wrapper(partial_func, func)
        setattr(self, "_sortable_field", partial_func)

    def get_changelist(self, request, **kwargs):
        ChangeList = super().get_changelist(request, **kwargs)  # noqa: F821
        SortableChangeList = type("SortableChangeList", (SortableChangeListMixin, ChangeList), {})
        SortableChangeList.sortable = self.sortable
        return SortableChangeList

    def get_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name  # noqa: F821
        urlpatterns = [
            path(
                "sort/",
                self.admin_site.admin_view(self.update_order),  # noqa: F821
                name="%s_%s_sort" % info
            ),
        ]
        return urlpatterns + super().get_urls()  # noqa: F821

    def _update_order(self, reorder_dict):
        with transaction.atomic():
            for pk, order in reorder_dict.items():
                self.model._default_manager.filter(pk=pk).update(**{  # noqa: F821
                    self.sortable: order
                })

    @csrf_exempt
    def update_order(self, request, *args, **kwargs):
        if request.method != "POST":
            return HttpResponseNotAllowed("Must be a POST request")
        if not self.has_change_permission(request):  # noqa: F821
            return HttpResponseForbidden("Missing permissions to perform this request")

        try:
            body = json.loads(request.body.decode())
        except json.JSONDecodeError:
            return HttpResponseBadRequest("Invalid JSON")

        reorder_dict = {}
        for pk, order in body.items():
            try:
                reorder_dict[int(pk)] = int(order)
            except (TypeError, ValueError):
                return HttpResponseBadRequest("Invalid order: `%s`" % order)

        self._update_order(reorder_dict)
        return JsonResponse({})

    def get_max_order(self, request, obj=None):
        return self.model._default_manager.aggregate(  # noqa: F821
            max_order=models.Max(self.sortable)
        )["max_order"] or 0

    def save_model(self, request, obj, form, change):
        if not change:
            setattr(obj, self.sortable, self.get_max_order(request, obj) + 1)
        super().save_model(request, obj, form, change)  # noqa: F821

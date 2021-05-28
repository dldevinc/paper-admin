import django
from django.contrib.admin.templatetags import admin_list
from django.contrib.admin.templatetags.admin_urls import add_preserved_filters
from django.contrib.admin.utils import display_for_field, display_for_value, lookup_field
from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from django.forms.utils import flatatt
from django.template import Library, loader
from django.urls import NoReverseMatch
from django.utils.functional import cached_property
from django.utils.html import format_html
from django.utils.safestring import mark_safe

register = Library()


class ResultRow:
    def __init__(self, request, cl, obj, form=None):
        self.request = request
        self.cl = cl
        self.obj = obj
        self.form = form

    def __iter__(self):
        yield from self.items_for_result()

    @property
    def model_admin(self):
        return self.cl.model_admin

    def has_add_permission(self):
        # для changelist_tools
        return self.model_admin.has_add_permission(self.request)

    def has_view_permission(self):
        # для changelist_tools
        return self.model_admin.has_view_permission(self.request, self.obj)

    def has_change_permission(self):
        # для changelist_tools
        return self.model_admin.has_change_permission(self.request, self.obj)

    def has_delete_permission(self):
        # для changelist_tools
        return self.model_admin.has_delete_permission(self.request, self.obj)

    def build_attrs(self):
        if self.cl.sortable_allowed:
            return {
                "data-id": self.obj.pk,
                "data-order-value": getattr(self.obj, self.model_admin.sortable, 0)
            }
        return {}

    def attrs(self):
        return flatatt(self.build_attrs() or {})

    def _link_in_col(self, is_first, field_name):
        if self.cl.list_display_links is None:
            return False
        if is_first and not self.cl.list_display_links:
            return True
        return field_name in self.cl.list_display_links

    def items_for_result(self):
        # 1. Removed "nowrap" CSS-class
        # 2. Removed <th> from table body
        # 3. Add "display_editable_field" function

        first = True
        pk = self.cl.lookup_opts.pk.attname
        for field_index, field_name in enumerate(self.cl.list_display):
            empty_value_display = self.cl.model_admin.get_empty_value_display()
            row_classes = ["field-%s" % admin_list._coerce_field_name(field_name, field_index)]

            try:
                f, attr, value = lookup_field(field_name, self.obj, self.cl.model_admin)
            except ObjectDoesNotExist:
                result_repr = empty_value_display
            else:
                empty_value_display = getattr(attr, "empty_value_display", empty_value_display)
                if f is None or f.auto_created:
                    if field_name == "action_checkbox":
                        row_classes = ["action-checkbox"]
                    boolean = getattr(attr, "boolean", False)
                    result_repr = display_for_value(value, empty_value_display, boolean)
                else:
                    if isinstance(f.remote_field, models.ManyToOneRel):
                        field_val = getattr(self.obj, f.name)
                        if field_val is None:
                            result_repr = empty_value_display
                        else:
                            result_repr = field_val
                    else:
                        result_repr = display_for_field(value, f, empty_value_display)

            row_class = mark_safe(" class='%s'" % " ".join(row_classes))

            # If list_display_links not defined, add the link tag to the first field
            if self._link_in_col(first, field_name):
                first = False

                # Display link to the result's change_view if the url exists, else
                # display just the result's representation.
                try:
                    url = self.cl.url_for_result(self.obj)
                except NoReverseMatch:
                    link_or_text = result_repr
                else:
                    url = add_preserved_filters({
                        "preserved_filters": self.cl.preserved_filters,
                        "opts": self.cl.opts
                    }, url)

                    # Convert the pk to something that can be used in Javascript.
                    # Problem cases are non-ASCII strings.
                    if self.cl.to_field:
                        attr = str(self.cl.to_field)
                    else:
                        attr = pk

                    value = self.obj.serializable_value(attr)
                    link_or_text = format_html(
                        '<a href="{}"{}>{}</a>',
                        url,
                        format_html(
                            ' data-popup-opener="{}"', value
                        ) if self.cl.is_popup else '',
                        result_repr
                    )

                yield format_html("<td{}>{}</td>", row_class, link_or_text)
            else:
                # By default the fields come from ModelAdmin.list_editable, but if we pull
                # the fields out of the form instead of list_editable custom admins
                # can provide fields on a per request basis
                if (
                    self.form
                    and field_name in self.form.fields
                    and not (field_name == self.cl.model._meta.pk.name
                             and self.form[self.cl.model._meta.pk.name].is_hidden)
                ):
                    result_repr = self.display_editable_field(field_name)
                yield format_html("<td{}>{}</td>", row_class, result_repr)

        if self.form and not self.form[self.cl.model._meta.pk.name].is_hidden:
            yield format_html("<td>{}</td>", self.form[self.cl.model._meta.pk.name])

    def display_editable_field(self, field_name):
        bf = self.form[field_name]
        return loader.render_to_string("paper_admin/includes/changelist_field.html", {
            "field": bf
        })


class ResultTable:
    row_class = ResultRow

    def __init__(self, request, cl):
        self.request = request
        self.cl = cl
        self.headers = list(admin_list.result_headers(cl))
        self.hidden_fields = list(admin_list.result_hidden_fields(cl))

    @property
    def model_admin(self):
        return self.cl.model_admin

    @cached_property
    def num_sorted_fields(self):
        num_sorted_fields = 0
        for h in self.headers:
            if h["sortable"] and h["sorted"]:
                num_sorted_fields += 1

        return num_sorted_fields

    @cached_property
    def column_count(self):
        num_columns = len(self.headers)

        if self.model_admin.sortable:
            num_columns += 1

        if self.model_admin.changelist_tools:
            num_columns += 1

        return num_columns

    def __iter__(self):
        if self.cl.formset:
            for res, form in zip(self.cl.result_list, self.cl.formset.forms):
                yield self.row_class(self.request, self.cl, res, form)
        else:
            for res in self.cl.result_list:
                yield self.row_class(self.request, self.cl, res)


def result_list_context(table):
    if django.VERSION >= (3, 2):
        current_page = table.cl.paginator.page(table.cl.page_num)
    else:
        current_page = table.cl.paginator.page(table.cl.page_num + 1)

    return {
        "cl": table.cl,
        "result_hidden_fields": table.hidden_fields,
        "result_headers": table.headers,
        "num_sorted_fields": table.num_sorted_fields,
        "results": table,

        "column_count": table.column_count,
        "current_page": current_page,
    }


@register.simple_tag(takes_context=True)
def paper_result_list(context, cl):
    request = context.get("request")
    if request is None:
        return ""

    table = ResultTable(request, cl)
    context = result_list_context(table)
    return loader.render_to_string("admin/change_list_results.html", context, request=request)

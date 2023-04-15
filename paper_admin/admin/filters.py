from django.contrib.admin import filters
from django.contrib.admin.options import IncorrectLookupParameters
from django.contrib.admin.utils import get_model_from_relation, reverse_field_path
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.db import models
from django.utils.dateparse import parse_date
from django.utils.translation import gettext_lazy as _

from paper_admin.conf import NONE_PLACEHOLDER


class SimpleListFilter(filters.SimpleListFilter):
    """
    Отличия от стандартного `SimpleListFilter`:
    1) Используется `request.GET.getlist()` вместо `request.GET.get()`,
       что позволяет указывать несколько значений.
    2) В choice-объект добавлено значение `value`.
    """

    def __init__(self, request, params, model, model_admin):
        has_value = self.parameter_name in params
        if has_value:
            params.pop(self.parameter_name, None)

        super().__init__(request, params, model, model_admin)

        if has_value:
            values_list = request.GET.getlist(self.parameter_name)
            self.used_parameters[self.parameter_name] = list(filter(lambda x: x != "", values_list))

    def value(self):
        return self.used_parameters.get(self.parameter_name, [])

    def choices(self, changelist):
        yield {
            "selected": not self.value(),
            "query_string": changelist.get_query_string(remove=[self.parameter_name]),
            "value": "",
            "display": _("All"),
        }
        for lookup, title in self.lookup_choices:
            yield {
                "selected": str(lookup) in self.value(),
                "query_string": changelist.get_query_string(
                    {self.parameter_name: lookup}
                ),
                "value": lookup,
                "display": title,
            }


class FieldListFilter(filters.FieldListFilter):
    def __init__(self, field, request, params, model, model_admin, field_path):
        super().__init__(field, request, params, model, model_admin, field_path)
        # Use `self.value` instead of `self.used_parameters` to support "%s__in" search.
        self.value = [
            v if v != NONE_PLACEHOLDER else None
            for v in request.GET.getlist(self.parameter_name)
            if v != ""
        ]

    @property
    def parameter_name(self):
        return self.field_path

    def expected_parameters(self):
        return [self.parameter_name]

    def get_query(self, value):
        if not value:
            return models.Q()
        elif len(value) == 1:
            return models.Q((self.field_path, value[0]))
        else:
            return models.Q(("%s__in" % self.field_path, value))

    def queryset(self, request, queryset):
        try:
            return queryset.filter(self.get_query(self.value))
        except (ValueError, ValidationError) as e:
            # Fields may raise a ValueError or ValidationError when converting
            # the parameters to the correct type.
            raise IncorrectLookupParameters(e)


class BooleanFieldListFilter(FieldListFilter):
    template = "paper_admin/filters/radio.html"

    def choices(self, changelist):
        yield {
            "selected": not self.value,
            "value": "",
            "display": _("All")
        }

        field_choices = dict(self.field.flatchoices)
        for lookup, title in (
            ("1", field_choices.get(True, _("Yes"))),
            ("0", field_choices.get(False, _("No")))
        ):
            yield {
                "selected": lookup in self.value,
                "value": lookup,
                "display": title,
            }
        if self.field.null:
            yield {
                "selected": None in self.value,
                "value": None,
                "display": field_choices.get(None, _("Unknown")),
            }


class ChoicesFieldListFilter(FieldListFilter):
    template = "paper_admin/filters/checkbox.html"

    def choices(self, changelist):
        for lookup, title in self.field.flatchoices:
            yield {
                "selected": str(lookup) in self.value,
                "value": str(lookup),
                "display": title,
            }
        if self.field.null:
            yield {
                "selected": None in self.value,
                "value": NONE_PLACEHOLDER,
                "display": _("Unknown"),
            }


class DateFieldListFilter(FieldListFilter):
    template = "paper_admin/filters/daterange.html"

    def __init__(self, field, request, params, model, model_admin, field_path):
        self.field = field
        self.field_path = field_path
        self.title = getattr(field, "verbose_name", field_path)
        super(filters.FieldListFilter, self).__init__(request, params, model, model_admin)
        params.pop(self.start_parameter_name, None)
        params.pop(self.end_parameter_name, None)
        self.value = (
            request.GET.get(self.start_parameter_name),
            request.GET.get(self.end_parameter_name),
        )

    @property
    def start_parameter_name(self):
        return "{}-start".format(self.parameter_name)

    @property
    def end_parameter_name(self):
        return "{}-end".format(self.parameter_name)

    def choices(self, changelist):
        return []

    def get_query(self, value):
        if not value:
            return models.Q()
        else:
            lookup_since = "%s__gte" % self.field_path
            lookup_until = "%s__lt" % self.field_path

            lookup_conditions = []
            since, until = value
            if since:
                lookup_conditions.append((lookup_since, parse_date(since)))
            if until:
                lookup_conditions.append((lookup_until, parse_date(until)))
            return models.Q(*lookup_conditions)


class RelatedFieldListFilter(FieldListFilter):
    include_blank = True
    blank_choice = [(NONE_PLACEHOLDER, _("Unknown"))]
    template = "paper_admin/filters/select.html"

    def __init__(self, field, request, params, model, model_admin, field_path):
        other_model = get_model_from_relation(field)
        super().__init__(field, request, params, model, model_admin, field_path)
        self.lookup_choices = self.field_choices(field, request, model_admin)
        if hasattr(field, "verbose_name"):
            self.lookup_title = field.verbose_name
        else:
            self.lookup_title = other_model._meta.verbose_name
        self.title = self.lookup_title
        self.empty_value_display = model_admin.get_empty_value_display()

    @property
    def include_empty_choice(self):
        return self.include_blank and (
            self.field.null or (self.field.is_relation and self.field.many_to_many)
        )

    @property
    def get_empty_value_display(self):
        return

    def has_output(self):
        if self.include_empty_choice:
            extra = 1
        else:
            extra = 0
        return len(self.lookup_choices) + extra > 1

    def field_admin_ordering(self, field, request, model_admin):
        related_admin = model_admin.admin_site._registry.get(field.remote_field.model)
        if related_admin is not None:
            return related_admin.get_ordering(request)
        return ()

    def field_choices(self, field, request, model_admin):
        ordering = self.field_admin_ordering(field, request, model_admin)
        return field.get_choices(
            include_blank=self.include_empty_choice,
            blank_choice=self.blank_choice,
            ordering=ordering
        )

    def choices(self, changelist):
        yield {
            "selected": not self.value,
            "value": "",
            "display": _("All")
        }
        for lookup, title in self.lookup_choices:
            lookup = str(lookup) if lookup != NONE_PLACEHOLDER else None
            yield {
                "selected": lookup in self.value,
                "value": lookup,
                "display": title,
            }

    def get_query(self, value):
        if not value:
            return models.Q()

        blank_choice_lookups = set(
            lookup if lookup != NONE_PLACEHOLDER else None
            for lookup, title in self.blank_choice
        )
        selected_choices = set(self.value).difference(blank_choice_lookups)

        lookup_choice = self.field_path
        lookup_choices = "%s__in" % self.field_path
        lookup_blank = "%s__isnull" % self.field_path

        lookup_conditions = []
        if len(selected_choices) == 1:
            lookup_conditions.append((lookup_choice, selected_choices.pop()))
        elif selected_choices:
            lookup_conditions.append((lookup_choices, selected_choices))
        else:
            lookup_conditions.append((lookup_blank, True))
        return models.Q(*lookup_conditions, _connector=models.Q.OR)


class AllValuesFieldListFilter(FieldListFilter):
    template = "paper_admin/filters/select.html"

    def __init__(self, field, request, params, model, model_admin, field_path):
        super().__init__(field, request, params, model, model_admin, field_path)
        parent_model, reverse_path = reverse_field_path(model, field_path)
        if model == parent_model:
            queryset = model_admin.get_queryset(request)
        else:
            queryset = parent_model._default_manager.all()
        self.lookup_choices = (
            queryset.distinct().order_by(field.name).values_list(field.name, flat=True)
        )

    def choices(self, changelist):
        yield {
            "selected": not self.value,
            "value": "",
            "display": _("All")
        }
        include_none = False
        for val in self.lookup_choices:
            if val is None:
                include_none = True
                continue
            val = str(val)
            yield {
                "selected": val in self.value,
                "value": val,
                "display": val,
            }
        if include_none:
            yield {
                "selected": None in self.value,
                "value": NONE_PLACEHOLDER,
                "display": _("Unknown"),
            }


class RelatedOnlyFieldListFilter(RelatedFieldListFilter):
    def field_choices(self, field, request, model_admin):
        pk_qs = (
            model_admin.get_queryset(request)
            .distinct()
            .values_list("%s__pk" % self.field_path, flat=True)
        )
        ordering = self.field_admin_ordering(field, request, model_admin)
        return field.get_choices(
            include_blank=self.include_empty_choice,
            blank_choice=self.blank_choice,
            limit_choices_to={"pk__in": pk_qs},
            ordering=ordering
        )


class EmptyFieldListFilter(FieldListFilter):
    template = "paper_admin/filters/select.html"

    def choices(self, changelist):
        yield {
            "selected": not self.value,
            "value": "",
            "display": _("All")
        }
        for lookup, title in (
            ("1", _("Empty")),
            ("0", _("Not empty"))
        ):
            yield {
                "selected": lookup in self.value,
                "value": lookup,
                "display": title,
            }

    def get_query(self, value):
        if not value:
            return models.Q()

        lookup_conditions = []
        if self.field.empty_strings_allowed:
            lookup_conditions.append((self.field_path, ""))
        if self.field.null:
            lookup_conditions.append((f"{self.field_path}__isnull", True))
        return models.Q(*lookup_conditions, _connector=models.Q.OR)

    def queryset(self, request, queryset):
        if not self.value:
            return queryset

        if self.value not in {"0", "1"}:
            raise IncorrectLookupParameters

        try:
            if self.value == "1":
                return queryset.filter(self.get_query(self.value))
            else:
                return queryset.exclude(self.get_query(self.value))
        except (ValueError, ValidationError) as e:
            # Fields may raise a ValueError or ValidationError when converting
            # the parameters to the correct type.
            raise IncorrectLookupParameters(e)


class HierarchyFilter(filters.ListFilter):
    placement = "top"
    parameter_name = None
    template = "paper_admin/filters/hierarchy.html"

    def __init__(self, request, params, model, model_admin):
        has_value = self.parameter_name in params
        if has_value:
            params.pop(self.parameter_name, None)

        super().__init__(request, params, model, model_admin)
        if self.parameter_name is None:
            raise ImproperlyConfigured(
                "The list filter '%s' does not specify a 'parameter_name'."
                % self.__class__.__name__
            )

        if has_value:
            values_list = request.GET.getlist(self.parameter_name)
            self.used_parameters[self.parameter_name] = list(filter(lambda x: x != "", values_list))

    def has_output(self):
        return True

    def value(self):
        return self.used_parameters.get(self.parameter_name, [])

    def lookups(self, changelist):
        raise NotImplementedError(
            "The HierarchyFilter.lookups() method must be overridden to "
            "return a list of tuples (value, verbose value)."
        )

    def expected_parameters(self):
        return [self.parameter_name]

    def choices(self, changelist):
        yield {
            "selected": not self.value(),
            "query_string": changelist.get_query_string(remove=[self.parameter_name]),
            "display": _("All"),
        }

        for lookup, title in self.lookups(changelist):
            yield {
                "selected": str(lookup) in self.value(),
                "query_string": changelist.get_query_string(
                    {self.parameter_name: lookup}
                ),
                "display": title,
            }

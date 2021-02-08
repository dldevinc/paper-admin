import datetime
import operator

from django.contrib.admin import filters
from django.contrib.admin.options import IncorrectLookupParameters
from django.contrib.admin.utils import get_model_from_relation, reverse_field_path
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class FieldListFilter(filters.ListFilter):
    def __init__(self, field, request, params, model, model_admin, field_path):
        self.field = field
        self.field_path = field_path
        self.title = getattr(field, "verbose_name", field_path)
        super().__init__(request, params, model, model_admin)
        params.pop(self.field_path, None)
        values_list = request.GET.getlist(self.field_path)
        self.value = list(filter(lambda x: x != "", values_list))

    def get_template(self):
        return self.template

    def has_output(self):
        return True

    def get_query(self, value):
        if not value:
            return

        value = [
            None if item == "None" else item
            for item in value
        ]

        if len(value) == 1:
            return models.Q((self.field_path, value[0]))
        else:
            return models.Q(("%s__in" % self.field_path, value))

    def queryset(self, request, queryset):
        query = self.get_query(self.value)
        if query is None:
            return queryset

        try:
            return queryset.filter(query)
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
        for lookup, title in (
                ("1", _("Yes")),
                ("0", _("No"))):
            yield {
                "selected": lookup in self.value,
                "value": lookup,
                "display": title,
            }
        if isinstance(self.field, models.NullBooleanField):
            yield {
                "selected": "None" in self.value,
                "value": "None",
                "display": _("None"),
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
                "selected": "None" in self.value,
                "value": "None",
                "display": _("None"),
            }


class DateFieldListFilter(FieldListFilter):
    template = "paper_admin/filters/radio.html"

    def choices(self, changelist):
        yield {
            "selected": not self.value,
            "value": "",
            "display": _("Any date"),
        }
        for lookup, title in (
                ("today", _("Today")),
                ("week", _("This week")),
                ("month", _("This month")),
                ("year", _("This year")),
        ):
            yield {
                "selected": lookup in self.value,
                "value": lookup,
                "display": title,
            }
        if self.field.null:
            yield {
                "selected": "None" in self.value,
                "value": "None",
                "display": _("None"),
            }

    def get_query(self, value):
        now = timezone.now()
        if timezone.is_aware(now):
            now = timezone.localtime(now)

        if isinstance(self.field, models.DateTimeField):
            today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        else:  # field is a models.DateField
            today = now.date()

        tomorrow = today + datetime.timedelta(days=1)
        if today.month == 12:
            next_month = today.replace(year=today.year + 1, month=1, day=1)
        else:
            next_month = today.replace(month=today.month + 1, day=1)
        next_year = today.replace(year=today.year + 1, month=1, day=1)

        lookup_since = "%s__gte" % self.field_path
        lookup_until = "%s__lt" % self.field_path

        if not value:
            return
        elif len(value) == 1:
            value = value[0]
            if value == "None":
                return models.Q((self.field_path, None))
            elif value == "today":
                return models.Q((lookup_since, today)) & models.Q((lookup_until, tomorrow))
            elif value == "week":
                return models.Q((lookup_since, today - datetime.timedelta(days=7))) & models.Q((lookup_until, tomorrow))
            elif value == "month":
                return models.Q((lookup_since, today.replace(day=1))) & models.Q((lookup_until, next_month))
            elif value == "year":
                return models.Q((lookup_since, today.replace(month=1, day=1))) & models.Q((lookup_until, next_year))
        raise ValueError(value)


class RelatedFieldListFilter(FieldListFilter):
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

    @property
    def include_empty_choice(self):
        """
        Return True if a "(None)" choice should be included, which filters
        out everything except empty relationships.
        """
        return self.field.null or (self.field.is_relation and self.field.many_to_many)

    def has_output(self):
        if self.include_empty_choice:
            extra = 1
        else:
            extra = 0
        return len(self.lookup_choices) + extra > 1

    def field_choices(self, field, request, model_admin):
        rel_model = field.remote_field.model
        choice_func = operator.attrgetter(
            field.remote_field.get_related_field().attname
            if hasattr(field.remote_field, "get_related_field")
            else "pk"
        )

        queryset = rel_model._default_manager.all()
        is_ordered = bool(queryset.query.order_by or rel_model._meta.ordering)
        if not is_ordered:
            related_admin = model_admin.admin_site._registry.get(field.remote_field.model)
            if related_admin is not None:
                admin_ordering = related_admin.get_ordering(request)
                queryset = queryset.order_by(*admin_ordering)
        return [(choice_func(x), str(x)) for x in queryset]

    def choices(self, changelist):
        yield {
            "selected": not self.value,
            "value": "",
            "display": _("All")
        }
        for pk, title in self.lookup_choices:
            yield {
                "selected": str(pk) in self.value,
                "value": str(pk),
                "display": title,
            }
        if self.include_empty_choice:
            yield {
                "selected": "None" in self.value,
                "value": "None",
                "display": _("None"),
            }


class AllValuesFieldListFilter(FieldListFilter):
    template = "paper_admin/filters/select.html"

    def __init__(self, field, request, params, model, model_admin, field_path):
        super().__init__(field, request, params, model, model_admin, field_path)
        parent_model, reverse_path = reverse_field_path(model, field_path)
        if model == parent_model:
            queryset = model_admin.get_queryset(request)
        else:
            queryset = parent_model._default_manager.all()
        self.lookup_choices = (queryset
                               .distinct()
                               .order_by(field.name)
                               .values_list(field.name, flat=True))

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
                "selected": "None" in self.value,
                "value": "None",
                "display": _("None"),
            }


filters.FieldListFilter.register(
    lambda f: f.remote_field,
    RelatedFieldListFilter,
    take_priority=True
)

filters.FieldListFilter.register(
    lambda f: isinstance(f, (models.BooleanField, models.NullBooleanField)),
    BooleanFieldListFilter,
    take_priority=True
)

filters.FieldListFilter.register(
    lambda f: bool(f.choices),
    ChoicesFieldListFilter,
    take_priority=True
)

filters.FieldListFilter.register(
    lambda f: isinstance(f, models.DateField),
    DateFieldListFilter,
    take_priority=True
)

filters.FieldListFilter.register(
    lambda f: True,
    AllValuesFieldListFilter,
    take_priority=True
)

from django.contrib.admin import filters
from django.db import models

from paper_admin.admin.filters import (
    AllValuesFieldListFilter,
    BooleanFieldListFilter,
    ChoicesFieldListFilter,
    DateFieldListFilter,
    RelatedFieldListFilter,
)

filters.FieldListFilter.register(
    lambda f: f.remote_field,
    RelatedFieldListFilter,
    take_priority=True,
)

filters.FieldListFilter.register(
    lambda f: isinstance(f, (models.BooleanField, models.NullBooleanField)),
    BooleanFieldListFilter,
    take_priority=True,
)

filters.FieldListFilter.register(
    lambda f: bool(f.choices),
    ChoicesFieldListFilter,
    take_priority=True,
)

filters.FieldListFilter.register(
    lambda f: isinstance(f, models.DateField),
    DateFieldListFilter,
    take_priority=True,
)

filters.FieldListFilter.register(
    lambda f: True,
    AllValuesFieldListFilter,
    take_priority=True,
)

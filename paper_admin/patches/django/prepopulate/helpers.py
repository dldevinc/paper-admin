from django.contrib.admin.helpers import (
    AdminField,
    AdminForm,
    AdminReadonlyField,
    Fieldline,
    Fieldset,
    InlineAdminForm,
    InlineFieldset,
)
from django.utils.functional import cached_property

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original


class PatchAdminField(AdminField, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        prepopulated_fields = kwargs.pop("prepopulated_fields", None) or {}
        get_original(AdminField)(self, *args, **kwargs)
        self.is_prepopulated = self.field.name in prepopulated_fields


class PatchAdminReadonlyField(AdminReadonlyField, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        get_original(AdminReadonlyField)(self, *args, **kwargs)
        self.is_prepopulated = False
        self.field["contents"] = self.contents()


class PatchFieldline(Fieldline, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        self.prepopulated_fields = kwargs.pop("prepopulated_fields", None) or {}
        get_original(Fieldline)(self, *args, **kwargs)

    def __iter__(self):
        for i, field in enumerate(self.fields):
            if field in self.readonly_fields:
                yield AdminReadonlyField(
                    self.form,
                    field,
                    is_first=(i == 0),
                    model_admin=self.model_admin
                )
            else:
                yield AdminField(
                    self.form,
                    field,
                    is_first=(i == 0),
                    prepopulated_fields=self.prepopulated_fields  # noqa
                )


class PatchFieldset(Fieldset, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        self.prepopulated_fields = kwargs.pop("prepopulated_fields", None)
        get_original(Fieldset)(self, *args, **kwargs)

    def __iter__(self):
        return iter(self.lines)

    @cached_property
    def lines(self):
        return tuple(
            Fieldline(
                self.form,
                field,
                self.readonly_fields,
                model_admin=self.model_admin,
                prepopulated_fields=self.prepopulated_fields  # noqa
            )
            for field in self.fields
        )


class PatchAdminForm(AdminForm, metaclass=MonkeyPatchMeta):
    def __init__(
        self,
        form,
        fieldsets,
        prepopulated_fields,
        readonly_fields=None,
        model_admin=None
    ):
        get_original(AdminForm)(
            self,
            form,
            fieldsets,
            prepopulated_fields,
            readonly_fields=readonly_fields,
            model_admin=model_admin
        )
        self.prepopulated_fields = prepopulated_fields

    def __iter__(self):
        for name, options in self.fieldsets:
            yield Fieldset(
                self.form,
                name,
                readonly_fields=self.readonly_fields,
                model_admin=self.model_admin,
                prepopulated_fields=self.prepopulated_fields,  # noqa
                **options
            )


class PatchInlineFieldset(InlineFieldset, metaclass=MonkeyPatchMeta):
    def __iter__(self):
        return iter(self.lines)

    @cached_property
    def lines(self):
        fk = getattr(self.formset, "fk", None)
        return tuple(
            Fieldline(
                self.form,
                field,
                self.readonly_fields,
                model_admin=self.model_admin,
                prepopulated_fields=self.prepopulated_fields  # noqa
            )
            for field in self.fields
            if not fk or fk.name != field
        )


class PatchInlineAdminForm(InlineAdminForm, metaclass=MonkeyPatchMeta):
    def __iter__(self):
        for name, options in self.fieldsets:
            yield InlineFieldset(
                self.formset,
                self.form,
                name,
                self.readonly_fields,
                model_admin=self.model_admin,
                prepopulated_fields=self.prepopulated_fields,
                **options
            )

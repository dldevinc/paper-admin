from collections import OrderedDict

from django.contrib.admin.views.main import ChangeList

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original


class PatchChangeList(ChangeList, metaclass=MonkeyPatchMeta):
    @property
    def sortable_allowed(self):
        return bool(self.model_admin.sortable and self.model_admin.has_change_permission(self.request))

    def get_ordering(self, request, queryset):
        if self.sortable_allowed:
            return [self.model_admin.sortable, "-" + self.model._meta.pk.name]
        else:
            return get_original(ChangeList)(self, request, queryset)

    def get_ordering_field_columns(self):
        if self.sortable_allowed:
            return OrderedDict()
        else:
            return get_original(ChangeList)(self)

from django.contrib.admin.helpers import InlineAdminFormSet

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original


class PatchInlineAdminFormSet(InlineAdminFormSet, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        get_original(InlineAdminFormSet)(self, *args, **kwargs)
        self.sortable_allowed = self.model_admin.sortable and self.has_change_permission

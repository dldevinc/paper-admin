from django.contrib.admin.helpers import Fieldset, InlineAdminFormSet

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original


class PatchFieldset(Fieldset, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        self.tab = kwargs.pop("tab", None)
        get_original(Fieldset)(self, *args, **kwargs)


class PatchInlineAdminFormSet(InlineAdminFormSet, metaclass=MonkeyPatchMeta):
    @property
    def tab(self):
        return getattr(self.opts, "tab", None)

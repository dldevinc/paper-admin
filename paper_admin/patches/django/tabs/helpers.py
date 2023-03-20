from django.contrib.admin.helpers import Fieldset, InlineAdminFormSet

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

from .utils import check_tab_name


class PatchFieldset(Fieldset, metaclass=MonkeyPatchMeta):
    def __init__(self, *args, **kwargs):
        self.tab = kwargs.pop("tab", None)
        check_tab_name(self.tab)
        get_original(Fieldset)(self, *args, **kwargs)


class PatchInlineAdminFormSet(InlineAdminFormSet, metaclass=MonkeyPatchMeta):
    @property
    def tab(self):
        tab_name = getattr(self.opts, "tab", None)
        check_tab_name(tab_name)
        return tab_name

from django import forms
from django.contrib.admin.options import ModelAdmin
from django.utils.functional import cached_property
from django.utils.translation import gettext_lazy as _

from paper_admin import conf
from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class AdminTab:
    def __init__(self, request, name, title):
        self.request = request
        self._name = name
        self._title = title
        self.active = False
        self.fieldsets = []
        self.inline_formsets = []

    @property
    def name(self):
        return self._name

    @property
    def title(self):
        return self._title

    @cached_property
    def invalid(self):
        return any(f.errors for f in self.fieldsets) or any(
            f.errors
            for fs in self.inline_formsets
            for f in fs
        )


class PatchModelAdmin(ModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    tabs = [
        (conf.DEFAULT_TAB_NAME, conf.DEFAULT_TAB_TITLE)
    ]

    def get_tabs(self, request, obj=None):
        return list(self.tabs)

    def render_change_form(self, request, context, add=False, change=False, form_url='', obj=None):
        tabs_config = self.get_tabs(request, obj)
        if conf.DEFAULT_TAB_NAME in dict(tabs_config):
            default_tab_name = conf.DEFAULT_TAB_NAME
        elif tabs_config:
            default_tab_name = tabs_config[0][0]
        else:
            raise RuntimeError("at least one tab required")

        tabs = []
        adminform = context.get("adminform")
        inline_formsets = context.get("inline_admin_formsets")
        for tab_name, tab_title in self.get_tabs(request, obj):
            tab_obj = AdminTab(request, tab_name, tab_title)
            for fieldset in adminform:
                if fieldset.tab == tab_name or (fieldset.tab is None and tab_name == default_tab_name):
                    tab_obj.fieldsets.append(fieldset)
            for inline_formset in inline_formsets:
                if inline_formset.tab == tab_name or (inline_formset.tab is None and tab_name == default_tab_name):
                    tab_obj.inline_formsets.append(inline_formset)
            tabs.append(tab_obj)

        if len(tabs) > 1:
            for tab in tabs:
                if tab.invalid:
                    tab.active = True
                    break
            else:
                tabs[0].active = True
            context["tabs"] = tabs

        return get_original(ModelAdmin)(self, request, context, add=add, change=change, form_url=form_url, obj=obj)

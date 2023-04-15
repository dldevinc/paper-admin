import logging

from django import forms
from django.contrib.admin.options import ModelAdmin
from django.utils.functional import cached_property

from paper_admin import conf
from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

from .utils import check_tab_name

logger = logging.getLogger("paper_admin.tabs")

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

        known_tab_names = set(t[0] for t in tabs_config)
        fieldsets = [
            (default_tab_name if fieldset.tab is None else fieldset.tab, fieldset)
            for fieldset in context.get("adminform")
        ]
        inline_formsets = [
            (default_tab_name if formset.tab is None else formset.tab, formset)
            for formset in context.get("inline_admin_formsets")
        ]

        # Warn about fieldsets and formsets with unknown tab names
        for tab_name, _ in fieldsets:
            if tab_name not in known_tab_names:
                logger.warning(
                    f"{self.__module__}.{self.__class__.__name__} "
                    f"has fieldset with unknown tab name: '{tab_name}'"
                )

        for tab_name, inline_formset in inline_formsets:
            if tab_name not in known_tab_names:
                logger.warning(
                    f"{self.__module__}.{self.__class__.__name__} "
                    f"has inline formset with unknown tab name: '{tab_name}'"
                )

        tabs = []
        for tab_name, tab_title in tabs_config:
            check_tab_name(tab_name)

            admin_tab = AdminTab(request, tab_name, tab_title)
            admin_tab.fieldsets = [
                fieldset
                for fieldset_tab_name, fieldset in fieldsets
                if fieldset_tab_name == tab_name
            ]
            admin_tab.inline_formsets = [
                inline_formset
                for inline_formset_tab_name, inline_formset in inline_formsets
                if inline_formset_tab_name == tab_name
            ]
            tabs.append(admin_tab)

        if len(tabs) > 1:
            for tab in tabs:
                if tab.invalid:
                    tab.active = True
                    break
            else:
                tabs[0].active = True
            context["tabs"] = tabs

        return get_original(ModelAdmin)(self, request, context, add=add, change=change, form_url=form_url, obj=obj)

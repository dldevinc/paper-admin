import copy

from django import forms
from django.contrib.admin.helpers import ACTION_CHECKBOX_NAME
from django.contrib.admin.models import LogEntry
from django.contrib.auth import get_permission_codename, get_user_model
from django.db import models
from django.forms import BaseInlineFormSet
from django.forms.formsets import DELETION_FIELD_NAME
from django.utils.safestring import mark_safe
from django.utils.translation import gettext as _

from .. import conf
from ..forms import widgets
from ..forms.fields import SplitDateTimeField
from ..renderer import PaperFormRenderer
from . import helpers
from .changelist import RequestChangeListMixin

FORMFIELD_FOR_DBFIELD_DEFAULTS = {
    models.BooleanField: {
        "widget": widgets.CustomCheckboxInput,
    },
    models.NullBooleanField: {
        "widget": forms.NullBooleanSelect,
    },
    models.UUIDField: {
        "widget": widgets.UUIDInput,
    },
    models.GenericIPAddressField: {
        "widget": widgets.IPInput,
    },
    models.DateField: {
        "widget": widgets.DateInput,
    },
    models.DateTimeField: {
        "form_class": SplitDateTimeField,
        "widget": widgets.SplitDateTimeInput,
    },
    models.TextField: {
        "widget": widgets.AutosizeTextarea,
    },
    models.FileField: {
        "widget": forms.ClearableFileInput,
    },
    models.ImageField: {
        "widget": forms.ClearableFileInput,
    },
}


class PaperBaseModelAdmin:
    def __init__(self):
        """ Откат FORMFIELD_FOR_DBFIELD_DEFAULTS """
        overrides = copy.deepcopy(FORMFIELD_FOR_DBFIELD_DEFAULTS)
        for k, v in self.formfield_overrides.items():
            overrides.setdefault(k, {}).update(v)
        self.formfield_overrides = overrides

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name in self.radio_fields:  # noqa: F821
            # Avoid stomping on custom widget/choices arguments.
            if "widget" not in kwargs:
                kwargs["widget"] = widgets.CustomRadioSelect()
            if "choices" not in kwargs:
                kwargs["choices"] = db_field.get_choices(
                    include_blank=db_field.blank,
                    blank_choice=[("", _("None"))]
                )
        return db_field.formfield(**kwargs)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        db = kwargs.get("using")
        if db_field.name in self.get_autocomplete_fields(request):  # noqa: F821
            kwargs["widget"] = widgets.AutocompleteSelect(
                db_field.remote_field,
                self.admin_site,  # noqa: F821
                using=db
            )
        elif db_field.name in self.raw_id_fields:  # noqa: F821
            kwargs["widget"] = widgets.ForeignKeyRawIdWidget(
                db_field.remote_field,
                self.admin_site,  # noqa: F821
                using=db
            )
        elif db_field.name in self.radio_fields:  # noqa: F821
            kwargs["widget"] = widgets.CustomRadioSelect()
            kwargs["empty_label"] = _("None") if db_field.blank else None

        if "queryset" not in kwargs:
            queryset = self.get_field_queryset(db, db_field, request)  # noqa: F821
            if queryset is not None:
                kwargs["queryset"] = queryset

        return db_field.formfield(**kwargs)

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if not db_field.remote_field.through._meta.auto_created:
            return None
        db = kwargs.get("using")

        autocomplete_fields = self.get_autocomplete_fields(request)  # noqa: F821
        if db_field.name in autocomplete_fields:
            kwargs["widget"] = widgets.AutocompleteSelectMultiple(
                db_field.remote_field,
                self.admin_site,  # noqa: F821
                using=db
            )
        elif db_field.name in self.raw_id_fields:  # noqa: F821
            kwargs["widget"] = widgets.ManyToManyRawIdWidget(
                db_field.remote_field,
                self.admin_site,  # noqa: F821
                using=db
            )
        elif db_field.name in list(self.filter_vertical) + list(self.filter_horizontal):  # noqa: F821
            kwargs["widget"] = widgets.FilteredSelectMultiple()
        else:
            kwargs.setdefault("widget", forms.SelectMultiple)

        if "queryset" not in kwargs:
            queryset = self.get_field_queryset(db, db_field, request)  # noqa: F821
            if queryset is not None:
                kwargs["queryset"] = queryset

        return db_field.formfield(**kwargs)


class PaperModelAdmin:
    action_form = helpers.ActionForm
    list_per_page = 25
    list_max_show_all = 50
    changelist_tools = True
    changelist_tools_template = "paper_admin/includes/changelist_tools.html"
    changelist_widget_overrides = {
        models.BooleanField: widgets.CustomCheckboxInput
    }
    tabs = [
        (conf.DEFAULT_TAB_NAME, conf.DEFAULT_TAB_TITLE)
    ]

    @property
    def media(self):
        return forms.Media(js=[])

    def get_form(self, request, obj=None, change=False, **kwargs):
        """
        Установка FORM_RENDERER по-умолчанию для changeform
        """
        form = self.get_form__overridden(request, obj, change, **kwargs)  # noqa: F821
        if form.default_renderer is None:
            form.default_renderer = PaperFormRenderer
        return form

    def get_changelist_form(self, request, **kwargs):
        """
        Установка FORM_RENDERER по-умолчанию для list_editable
        """
        form = self.get_changelist_form__overridden(request, **kwargs)  # noqa: F821
        if form.default_renderer is None:
            form.default_renderer = PaperFormRenderer
        return form

    def get_changelist(self, request, **kwargs):
        ChangeList = self.get_changelist__overridden(request, **kwargs)  # noqa: F821
        RequestChangeList = type("RequestChangeList", (RequestChangeListMixin, ChangeList), {})
        return RequestChangeList

    def get_changelist_formset(self, request, **kwargs):
        """
        Замена виджетов редактируемых полей на странице changelist.
        """
        widget_overrides = {}
        for db_field in self.model._meta.get_fields():
            if db_field.__class__ in self.changelist_widget_overrides:
                widget_overrides[db_field.name] = self.changelist_widget_overrides[db_field.__class__]
        kwargs["widgets"] = widget_overrides
        return self.get_changelist_formset__overridden(request, **kwargs)  # noqa: F821

    def action_checkbox(self, obj):
        return helpers.checkbox.render(ACTION_CHECKBOX_NAME, str(obj.pk), {
            "id": "{}-{}".format(ACTION_CHECKBOX_NAME, obj.pk)
        }, renderer=PaperFormRenderer())
    action_checkbox.short_description = mark_safe(
        helpers.checkbox_toggle.render("action-toggle", "", renderer=PaperFormRenderer())
    )

    def history_view(self, request, object_id, extra_context=None):
        log_opts = LogEntry._meta
        codename = get_permission_codename("change", log_opts)
        has_log_change_permission = request.user.has_perm("%s.%s" % (log_opts.app_label, codename))

        user_opts = get_user_model()._meta
        codename = get_permission_codename("change", user_opts)
        has_user_change_permission = request.user.has_perm("%s.%s" % (user_opts.app_label, codename))

        default_extra = {
            "log_opts": log_opts,
            "has_log_change_permission": has_log_change_permission,
            "user_opts": user_opts,
            "has_user_change_permission": has_user_change_permission,
        }
        default_extra.update(extra_context or {})
        return self.history_view__overridden(request, object_id, default_extra)  # noqa: F821

    def render_change_form(self, request, context, add=False, change=False, form_url="", obj=None):
        tabs_config = self.get_tabs(request, obj)
        if conf.DEFAULT_TAB_NAME in dict(tabs_config):
            default_tab_name = conf.DEFAULT_TAB_NAME
        elif tabs_config:
            default_tab_name = tabs_config[0][0]
        else:
            raise RuntimeError(_("at least one tab required"))

        tabs = []
        adminform = context.get("adminform")
        inline_formsets = context.get("inline_admin_formsets")
        for tab_name, tab_title in self.get_tabs(request, obj):
            tab_obj = helpers.AdminTab(request, tab_name, tab_title)
            for fieldset in adminform.fieldset_items:
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

        form_url = form_url or request.get_full_path()

        response = self.render_change_form__overridden(request, context, add, change, form_url, obj)  # noqa: F821

        # HACK: модификация контекста в объекте response, т.к. иначе никак :(
        ctx = response.context_data
        is_popup = ctx["is_popup"]
        save_as = ctx["save_as"]
        show_save = ctx.get("show_save", True)
        show_save_and_continue = ctx.get("show_save_and_continue", True)
        has_add_permission = ctx["has_add_permission"]
        has_change_permission = ctx["has_change_permission"]
        has_view_permission = ctx["has_view_permission"]
        has_editable_inline_admin_formsets = ctx["has_editable_inline_admin_formsets"]
        can_save = (has_change_permission and change) or (
                    has_add_permission and add) or has_editable_inline_admin_formsets

        can_save_and_continue = not is_popup and can_save and has_view_permission and show_save_and_continue
        can_change = has_change_permission or has_editable_inline_admin_formsets
        ctx.update({
            "can_change": can_change,
            "show_save": show_save and can_save,
            "show_save_as_new": not is_popup and has_change_permission and change and save_as,
            "show_save_and_continue": can_save_and_continue,
            "show_save_and_add_another": (
                    has_add_permission and not is_popup and
                    (not save_as or add) and can_save
            ),
            "show_delete_link": (
                    not is_popup and ctx["has_delete_permission"] and
                    change and ctx.get("show_delete", True)
            )
        })
        return response

    def get_tabs(self, request, obj=None):
        """
        Возвращает вкладки админки.

        :rtype: list of tuple
        """
        return list(self.tabs)

    def get_row_classes(self, request, obj):
        """
        Позволяет назначить CSS-классы для ряда таблицы changelist.

        :type request: django.core.handlers.wsgi.WSGIRequest
        :type obj: *
        :rtype: list of str
        """
        return []


class BasePaperInlineFormSet(BaseInlineFormSet):
    def add_fields(self, form, index):
        super().add_fields(form, index)
        if self.can_delete:
            form.fields[DELETION_FIELD_NAME] = forms.BooleanField(
                label=_("Delete"),
                required=False,
                widget=widgets.CustomCheckboxInput(attrs={
                    "class": "danger custom-control-input"
                })
            )


class PaperInlineModelAdmin:
    formset = BasePaperInlineFormSet

    @property
    def media(self):
        return forms.Media()

    def get_formset(self, request, obj=None, **kwargs):
        """
        Установка FORM_RENDERER, если он не задан явно
        """
        form = type(self.form.__name__, (self.form,), {})  # noqa: F821
        if form.default_renderer is None:
            form.default_renderer = PaperFormRenderer
        kwargs.setdefault("form", form)
        return self.get_formset__overridden(request, obj, **kwargs)  # noqa: F821


class RelatedFieldWidgetWrapper:
    """
    FIX: Проброс FORM_RENDERER в get_context, т.к. там рендерятся виджеты.
    Получается, что виджеты рендерятся не тем бэкендом, которым должны.
    """
    def get_context(self, name, value, attrs, renderer):
        from django.contrib.admin.views.main import IS_POPUP_VAR, TO_FIELD_VAR
        rel_opts = self.rel.model._meta  # noqa: F821
        info = (rel_opts.app_label, rel_opts.model_name)
        self.widget.choices = self.choices  # noqa: F821
        url_params = "&".join("%s=%s" % param for param in [
            (TO_FIELD_VAR, self.rel.get_related_field().name),  # noqa: F821
            (IS_POPUP_VAR, 1),
        ])
        context = {
            "rendered_widget": self.widget.render(name, value, attrs, renderer=renderer),  # noqa: F821
            "name": name,
            "url_params": url_params,
            "model": rel_opts.verbose_name,
            "can_add_related": self.can_add_related,  # noqa: F821
            "can_change_related": self.can_change_related,  # noqa: F821
            "can_delete_related": self.can_delete_related,  # noqa: F821
            "can_view_related": self.can_view_related,  # noqa: F821
        }
        if self.can_add_related:  # noqa: F821
            context["add_related_url"] = self.get_related_url(info, "add")  # noqa: F821
        if self.can_delete_related:  # noqa: F821
            context["delete_related_template_url"] = self.get_related_url(info, "delete", "__fk__")  # noqa: F821
        if self.can_view_related or self.can_change_related:  # noqa: F821
            context["change_related_template_url"] = self.get_related_url(info, "change", "__fk__")  # noqa: F821
        return context

    def render(self, name, value, attrs=None, renderer=None):
        context = self.get_context(name, value, attrs, renderer)
        return self._render(self.template_name, context, renderer)  # noqa: F821

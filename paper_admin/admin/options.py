import copy

from django import forms
from django.contrib.admin.models import LogEntry
from django.contrib.admin.utils import model_format_dict
from django.contrib.auth import get_permission_codename, get_user_model
from django.db import models
from django.db.models.fields import BLANK_CHOICE_DASH
from django.forms import BaseInlineFormSet
from django.forms.formsets import DELETION_FIELD_NAME
from django.utils.translation import gettext as _

from . import helpers, widgets


class PaperBaseModelAdmin:
    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name in self.radio_fields:  # noqa: F821
            # Avoid stomping on custom widget/choices arguments.
            if "widget" not in kwargs:
                kwargs["widget"] = widgets.AdminRadioSelect()
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
            kwargs["widget"] = widgets.AdminForeignKeyRawIdWidget(
                db_field.remote_field,
                self.admin_site,  # noqa: F821
                using=db
            )
        elif db_field.name in self.radio_fields:  # noqa: F821
            kwargs["widget"] = widgets.AdminRadioSelect()
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
            kwargs["widget"] = widgets.AdminManyToManyRawIdWidget(
                db_field.remote_field,
                self.admin_site,  # noqa: F821
                using=db
            )
        elif db_field.name in list(self.filter_vertical) + list(self.filter_horizontal):  # noqa: F821
            kwargs["widget"] = widgets.AdminSelectMultiple()
        else:
            kwargs.setdefault("widget", forms.SelectMultiple)

        if "queryset" not in kwargs:
            queryset = self.get_field_queryset(db, db_field, request)  # noqa: F821
            if queryset is not None:
                kwargs["queryset"] = queryset

        return db_field.formfield(**kwargs)


class PaperModelAdmin:
    action_form = helpers.ActionForm
    list_per_page = 20
    object_history = True  # show "History" button
    changelist_tools = True  # show buttons in changelist view
    changelist_tools_template = "paper_admin/includes/changelist_tools.html"
    changelist_widget_overrides = {
        models.BooleanField: widgets.AdminCheckboxInput
    }

    @property
    def media(self):
        return forms.Media(js=[])

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

    def get_action_choices(self, request, default_choices=BLANK_CHOICE_DASH):
        # Change empty action label
        choices = [("", _("Action"))]
        for func, name, description in self.get_actions(request).values():
            choice = (name, description % model_format_dict(self.opts))
            choices.append(choice)
        return choices

    def history_view(self, request, object_id, extra_context=None):
        log_opts = LogEntry._meta
        codename = get_permission_codename("change", log_opts)
        has_log_change_permission = request.user.has_perm(
            "%s.%s" % (log_opts.app_label, codename)
        )

        user_opts = get_user_model()._meta
        codename = get_permission_codename("change", user_opts)
        has_user_change_permission = request.user.has_perm(
            "%s.%s" % (user_opts.app_label, codename)
        )

        default_extra = {
            "log_opts": log_opts,
            "has_log_change_permission": has_log_change_permission,
            "user_opts": user_opts,
            "has_user_change_permission": has_user_change_permission,
        }
        default_extra.update(extra_context or {})
        return self.history_view__overridden(request, object_id, default_extra)  # noqa: F821

    def render_change_form(self, request, context, add=False, change=False, form_url="", obj=None):
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
        can_save = (
            (has_change_permission and change)
            or (has_add_permission and add)
            or has_editable_inline_admin_formsets
        )

        can_save_and_continue = (
            not is_popup and can_save and has_view_permission and show_save_and_continue
        )
        can_change = has_change_permission or has_editable_inline_admin_formsets
        ctx.update({
            "can_change": can_change,
            "show_history": self.object_history,
            "show_save": show_save and can_save,
            "show_save_as_new": (
                not is_popup
                and has_change_permission
                and change
                and save_as
            ),
            "show_save_and_continue": can_save_and_continue,
            "show_save_and_add_another": (
                has_add_permission
                and not is_popup
                and (not save_as or add)
                and can_save
            ),
            "show_delete_link": (
                not is_popup
                and ctx["has_delete_permission"]
                and change
                and ctx.get("show_delete", True)
            ),
        })
        return response

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
                widget=forms.CheckboxInput(attrs={
                    "class": "danger custom-control-input"
                })
            )


class PaperInlineModelAdmin:
    formset = BasePaperInlineFormSet

    @property
    def media(self):
        return forms.Media()

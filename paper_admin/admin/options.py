from django import forms
from django.contrib.admin.models import LogEntry
from django.contrib.admin.utils import model_format_dict
from django.contrib.auth import get_permission_codename, get_user_model
from django.db.models.fields import BLANK_CHOICE_DASH
from django.utils.translation import gettext as _

from . import helpers


class PaperModelAdmin:
    action_form = helpers.ActionForm
    list_per_page = 20
    object_history = True  # show "History" button
    changelist_tools = True  # show buttons in changelist view
    changelist_tools_template = "paper_admin/includes/changelist_tools.html"

    @property
    def media(self):
        return forms.Media(js=[])

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


class PaperInlineModelAdmin:

    @property
    def media(self):
        return forms.Media()

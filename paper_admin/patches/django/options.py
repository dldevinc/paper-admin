from django import forms
from django.contrib.admin.options import InlineModelAdmin, ModelAdmin, csrf_protect_m
from django.contrib.admin.utils import model_format_dict
from django.contrib.admin.views.main import SEARCH_VAR
from django.contrib.auth import get_permission_codename, get_user_model
from django.db.models.fields import BLANK_CHOICE_DASH
from django.utils.translation import gettext as _

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original

# Метакласс MonkeyPatch для класса BaseModelAdmin.
ModelAdminMonkeyPatchMeta = type("ModelAdminMonkeyPatchMeta", (MonkeyPatchMeta, forms.MediaDefiningClass), {})


class PatchModelAdmin(ModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    list_per_page = 20
    object_history = True  # show "History" button
    changelist_tools = True  # show buttons in changelist view
    changelist_tools_template = "paper_admin/includes/changelist_tools.html"

    @property
    def media(self):
        return forms.Media()

    def get_action_choices(self, request, default_choices=BLANK_CHOICE_DASH):
        # Изменение placeholder у выпадающего списка
        choices = [("", _("Action"))]
        for func, name, description in self.get_actions(request).values():
            choice = (name, description % model_format_dict(self.opts))
            choices.append(choice)
        return choices

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context["search_var"] = SEARCH_VAR
        return get_original(ModelAdmin)(self, request, extra_context=extra_context)

    def history_view(self, request, object_id, extra_context=None):
        # Добавление в список логов ссылки на пользователя и ссылки на запись лога
        from django.contrib.admin.models import LogEntry

        log_opts = LogEntry._meta
        codename = get_permission_codename("view", log_opts)
        has_log_change_permission = request.user.has_perm(
            "%s.%s" % (log_opts.app_label, codename)
        )
        log_model_registered = self.admin_site.is_registered(LogEntry)

        UserModel = get_user_model()
        user_opts = UserModel._meta
        codename = get_permission_codename("view", user_opts)
        has_user_change_permission = request.user.has_perm(
            "%s.%s" % (user_opts.app_label, codename)
        )
        user_model_registered = self.admin_site.is_registered(UserModel)

        default_extra = {
            "log_opts": log_opts,
            "user_opts": user_opts,
            "show_log_link": has_log_change_permission and log_model_registered,
            "show_user_link": has_user_change_permission and user_model_registered
        }
        default_extra.update(extra_context or {})
        return get_original(ModelAdmin)(self, request, object_id, default_extra)

    def render_change_form(self, request, context, add=False, change=False, form_url='', obj=None):
        response = get_original(ModelAdmin)(self, request, context, add=add, change=change, form_url=form_url, obj=obj)

        # Перенос кода из `admin_modify.submit_row`.
        _context = response.context_data
        add = _context["add"]
        change = _context["change"]
        is_popup = _context["is_popup"]
        save_as = _context["save_as"]
        show_save = _context.get("show_save", True)
        show_save_and_add_another = _context.get("show_save_and_add_another", True)
        show_save_and_continue = _context.get("show_save_and_continue", True)

        has_add_permission = _context["has_add_permission"]
        has_change_permission = _context["has_change_permission"]
        has_view_permission = _context["has_view_permission"]
        has_editable_inline_admin_formsets = _context["has_editable_inline_admin_formsets"]

        can_save = (
            (has_change_permission and change)
            or (has_add_permission and add)
            or has_editable_inline_admin_formsets
        )

        _context.update({
            "can_change": (
                has_change_permission
                or has_editable_inline_admin_formsets
            ),
            "show_delete_link": (
                not is_popup
                and _context["has_delete_permission"]
                and change
                and _context.get("show_delete", True)
            ),
            "show_save_as_new": (
                not is_popup
                and has_change_permission
                and change
                and save_as
            ),
            "show_save_and_add_another": (
                has_add_permission
                and not is_popup
                and (not save_as or add)
                and can_save
                and show_save_and_add_another
            ),
            "show_save_and_continue": (
                not is_popup
                and can_save
                and has_view_permission
                and show_save_and_continue
            ),
            "show_save": show_save and can_save,
            "show_close": not (show_save and can_save)
        })

        # Показывать ли кнопку логов
        _context["show_history"] = self.object_history

        return response


class PatchInlineModelAdmin(InlineModelAdmin, metaclass=ModelAdminMonkeyPatchMeta):
    @property
    def media(self):
        return forms.Media()

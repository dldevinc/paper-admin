from django.contrib.admin.widgets import RelatedFieldWidgetWrapper
from django.forms import widgets

from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса Widget.
WidgetMonkeyPatchMeta = type("WidgetMonkeyPatchMeta", (MonkeyPatchMeta, widgets.MediaDefiningClass, ), {})


class PatchRelatedFieldWidgetWrapper(RelatedFieldWidgetWrapper, metaclass=WidgetMonkeyPatchMeta):
    def get_context(self, name, value, attrs, renderer=None):
        # Реализация метода взята из Django 4.1.0
        # Добавлен аргумент renderer и проброшен во внутренний виджет.
        # Добавлен `model_ref` для обновления выпадающих списков, связанных
        # с одной и той же моделью.
        # Удален параметр IS_POPUP_VAR из url_params. Наличие этого параметра
        # теперь находится под контролем JS.
        from django.contrib.admin.views.main import TO_FIELD_VAR
        rel_opts = self.rel.model._meta
        info = (rel_opts.app_label, rel_opts.model_name)
        self.widget.choices = self.choices
        related_field_name = self.rel.get_related_field().name
        url_params = "&".join("%s=%s" % param for param in [
            (TO_FIELD_VAR, related_field_name),
            # (IS_POPUP_VAR, 1),
        ])
        context = {
            "rendered_widget": self.widget.render(name, value, attrs, renderer),
            "is_hidden": self.is_hidden,
            "name": name,
            "url_params": url_params,
            "model": rel_opts.verbose_name,
            "can_add_related": self.can_add_related,
            "can_change_related": self.can_change_related,
            "can_delete_related": self.can_delete_related,
            "can_view_related": self.can_view_related,
            "model_ref": ".".join(info),
            "model_has_limit_choices_to": self.rel.limit_choices_to,
        }
        if self.can_add_related:
            context["add_related_url"] = self.get_related_url(info, "add")
        if self.can_delete_related:
            context["delete_related_template_url"] = self.get_related_url(info, "delete", "__fk__")
        if self.can_view_related or self.can_change_related:
            context["change_related_template_url"] = self.get_related_url(info, "change", "__fk__")
        return context

    def render(self, name, value, attrs=None, renderer=None):
        context = self.get_context(name, value, attrs, renderer)
        return self._render(self.template_name, context, renderer)

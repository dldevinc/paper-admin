from dal.widgets import WidgetMixin
from dal_select2.widgets import I18N_PATH, Select2WidgetMixin
from django.conf import settings
from django.forms import widgets
from django.utils.safestring import mark_safe

from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса Widget.
WidgetMonkeyPatchMeta = type("WidgetMonkeyPatchMeta", (MonkeyPatchMeta, widgets.MediaDefiningClass, ), {})


class PatchWidgetMixin(WidgetMixin, metaclass=MonkeyPatchMeta):
    def render(self, name, value, attrs=None, renderer=None, **kwargs):
        # Добавлен параметр renderer
        widget = super(WidgetMixin, self).render(name, value, attrs, renderer=renderer, **kwargs)
        try:
            field_id = attrs['id']
        except (KeyError, TypeError):
            field_id = name
        conf = self.render_forward_conf(field_id)
        return mark_safe(widget + conf)


class PatchSelect2WidgetMixin(Select2WidgetMixin, metaclass=WidgetMonkeyPatchMeta):
    @property
    def media(self):
        extra = "" if settings.DEBUG else ".min"
        i18n_name = self._get_language_code()
        i18n_file = ("%s%s.js" % (I18N_PATH, i18n_name),) if i18n_name else ()

        return widgets.Media(
            js=(
                   "autocomplete_light/autocomplete_light%s.js" % extra,
                   "autocomplete_light/select2%s.js" % extra,
               ) + i18n_file,
        )

from dal.widgets import WidgetMixin as DefaultWidgetMixin
from dal_select2.widgets import I18N_PATH
from django import forms
from django.conf import settings
from django.utils.safestring import mark_safe


class WidgetMixin:
    def render(self, name, value, attrs=None, renderer=None, **kwargs):
        # FIX: Added missing renderer parameter
        widget = super(DefaultWidgetMixin, self).render(name, value, attrs, renderer=renderer, **kwargs)
        try:
            field_id = attrs['id']
        except (KeyError, TypeError):
            field_id = name
        conf = self.render_forward_conf(field_id)
        return mark_safe(widget + conf)


class Select2WidgetMixin:
    @property
    def media(self):
        extra = "" if settings.DEBUG else ".min"
        i18n_name = self._get_language_code()
        i18n_file = ("%s%s.js" % (I18N_PATH, i18n_name),) if i18n_name else ()

        return forms.Media(
            js=(
                "autocomplete_light/autocomplete_light%s.js" % extra,
                "autocomplete_light/select2%s.js" % extra,
            )
            + i18n_file,
        )

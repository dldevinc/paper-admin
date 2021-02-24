from dal_select2.widgets import I18N_PATH
from django import forms
from django.conf import settings


class Select2WidgetMixin:
    def build_attrs(self, *args, **kwargs):
        """Set data-autocomplete-light-theme."""
        attrs = self.build_attrs__overridden(*args, **kwargs)  # noqa: F821
        attrs.setdefault("data-theme", "admin-autocomplete")
        return attrs

    @property
    def media(self):
        """Return JS/CSS resources for the widget."""
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

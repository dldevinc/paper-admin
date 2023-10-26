from django.contrib.auth.forms import AdminPasswordChangeForm as AuthPasswordChangeForm
from django.forms.forms import DeclarativeFieldsMetaclass

from paper_admin.admin.renderers import PaperFormRenderer
from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса Form.
FormMonkeyPatchMeta = type("FormMonkeyPatchMeta", (MonkeyPatchMeta, DeclarativeFieldsMetaclass, ), {})


class PatchAuthPasswordChangeForm(AuthPasswordChangeForm, metaclass=FormMonkeyPatchMeta):
    default_renderer = PaperFormRenderer

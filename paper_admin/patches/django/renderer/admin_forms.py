from django.contrib.admin.forms import AdminPasswordChangeForm
from django.forms.forms import DeclarativeFieldsMetaclass

from paper_admin.admin.renderers import PaperFormRenderer
from paper_admin.monkey_patch import MonkeyPatchMeta

# Метакласс MonkeyPatch для класса Form.
FormMonkeyPatchMeta = type("FormMonkeyPatchMeta", (MonkeyPatchMeta, DeclarativeFieldsMetaclass, ), {})


class PatchAdminPasswordChangeForm(AdminPasswordChangeForm, metaclass=FormMonkeyPatchMeta):
    default_renderer = PaperFormRenderer

from django.forms import Media
from django.utils.html import format_html

from paper_admin.monkey_patch import MonkeyPatchMeta


class PatchMedia(Media, metaclass=MonkeyPatchMeta):
    def render_js(self):
        return [
            path.__html__()
            if hasattr(path, "__html__")
            else format_html('<script src="{}" defer></script>', self.absolute_path(path))
            for path in self._js
        ]

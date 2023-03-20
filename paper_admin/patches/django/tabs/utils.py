import re

from django.core.exceptions import ImproperlyConfigured


def check_tab_name(tab_name: str):
    if tab_name is not None and not re.fullmatch(r"[-\w.]+", tab_name):
        raise ImproperlyConfigured(
            "Tab name should contain only latin letters, digits, hyphens, dots and underscores. "
            f"Got '{tab_name}' instead."
        )

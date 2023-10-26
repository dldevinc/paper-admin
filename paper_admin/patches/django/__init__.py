import importhook

from . import (
    filters,
    forms,
    helpers,
    options,
    prepopulate,
    renderer,
    sites,
    sortable,
    styles,
    tabs,
    widgets,
)


@importhook.on_import("django.contrib.admin.views.main")
def on_view_import(module):
    from . import changelist

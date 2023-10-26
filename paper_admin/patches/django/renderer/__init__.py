import importhook
from . import options, widgets


@importhook.on_import("django.contrib.admin.forms")
def on_admin_forms_import(module):
    from . import admin_forms


@importhook.on_import("django.contrib.auth.forms")
def on_auth_forms_import(module):
    from . import auth_forms


@importhook.on_import("django.contrib.auth.admin")
def on_auth_forms_import(module):
    from . import auth

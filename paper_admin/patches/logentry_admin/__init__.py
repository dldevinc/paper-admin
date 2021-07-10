"""
INSTALLED_APPS = [
    "paper_admin",
    "paper_admin.patches.logentry_admin",
    ...
    "logentry_admin",
]

PAPER_MENU = [
    ...
    dict(
        label=_("Logs"),
        icon="fa fa-fw fa-lg fa-history",
        perms="admin.view_logentry",
        models=[
            "admin.LogEntry"
        ]
    ),
]
"""
default_app_config = "paper_admin.patches.logentry_admin.apps.Config"

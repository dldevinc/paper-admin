import os
import sys
from pathlib import Path

from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent

sys.path.insert(0, str(BASE_DIR))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "s3296tl(k324sma5wez=vyvta+w4!%ez3^nlj#hh5bn=n!i+gr"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]

TIME_INPUT_FORMATS = [
    "%H:%M",        # "14:30"
    "%H:%M:%S",     # "14:30:59"
    "%H:%M:%S.%f",  # "14:30:59.000200"
]

# Application definition

INSTALLED_APPS = [
    "paper_admin",
    "paper_admin.patches.dal",
    "paper_admin.patches.django_solo",
    "paper_admin.patches.logentry_admin",
    "paper_admin.patches.mptt",
    "paper_admin.patches.tree_queries",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "dal",
    "dal_select2",
    "mptt",
    "solo",
    "logentry_admin",

    "app",
    "sortables"
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.middleware.gzip.GZipMiddleware",
]

ROOT_URLCONF = "urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            str(BASE_DIR / "templates"),
        ],
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
            "loaders": [
                "django.template.loaders.filesystem.Loader",
                "django.template.loaders.app_directories.Loader",
            ],
        },
    },
]

WSGI_APPLICATION = "wsgi.application"

# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": str(BASE_DIR / "db.sqlite3"),
    }
}

# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = str(BASE_DIR / "static")

MEDIA_URL = "/media/"
MEDIA_ROOT = str(BASE_DIR / "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
FILE_UPLOAD_PERMISSIONS = 0o666

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

LOGIN_URL = "admin:login"

MPTT_DEFAULT_LEVEL_INDICATOR = "┄"

# =============
#  Paper Admin
# =============
PAPER_FAVICON = "app/favicon.png"

PAPER_ENVIRONMENT_NAME = "development"
PAPER_ENVIRONMENT_COLOR = "#FFFF00"

PAPER_MENU = [
    dict(
        label=_("Dashboard"),
        url="admin:index",
        icon="fa fa-fw fa-lg fa-area-chart",
    ),
    dict(
        app="app",
        icon="fa fa-fw fa-lg fa-home",
        models=[
            dict(
                label=_("Index"),
                url=reverse_lazy("admin:app_list", kwargs={
                    "app_label": "app"
                })
            ),
            "Widgets",
            dict(
                label=_("Filters"),
                url="admin:app_message_changelist"
            ),
            dict(
                label=_("Inlines"),
                url="admin:app_book_changelist"
            ),
            "Sigleton",
            dict(
                label=_("Category"),
                url="admin:app_category_changelist",
                perms="app.category_add"
            ),
            dict(
                label=_("Trees"),
                models=[
                    "MPTTTree",
                    "DjangoTreeQueriesNode",
                ]
            ),
        ]
    ),
    dict(
        app="sortables",
        models=[
            "Company",
            dict(
                label=_("Trees"),
                models=[
                    "MPTTTree",
                    "DjangoTreeQueriesNode",
                ]
            ),
        ]
    ),
    "-",
    "auth",
    dict(
        label=_("Logs"),
        icon="fa fa-fw fa-lg fa-history",
        perms="admin.view_logentry",
        models=[
            "admin.LogEntry"
        ]
    ),
]

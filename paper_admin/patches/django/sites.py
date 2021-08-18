from django.contrib.admin.sites import AdminSite
from django.views.i18n import JavaScriptCatalog

from paper_admin.conf import LOCALE_PACKAGES
from paper_admin.monkey_patch import MonkeyPatchMeta, get_original


class PatchAdminSite(AdminSite, metaclass=MonkeyPatchMeta):
    def get_urls(self):
        from django.urls import path
        urlpatterns = get_original(AdminSite)(self)

        # Снимаем требование прав доступа на JS-каталог
        for index, url in enumerate(urlpatterns):
            if url.name == "jsi18n":
                urlpatterns.pop(index)
                urlpatterns.insert(index, path('jsi18n/', self.i18n_javascript, name='jsi18n'))
                break

        return urlpatterns

    def password_change(self, request, extra_context=None):
        # Добавляем шаблонную переменную opts, как в changeform
        from django.contrib.auth import get_user_model
        UserModel = get_user_model()
        extra_context = extra_context or {}
        extra_context.setdefault("opts", UserModel._meta)
        return get_original(AdminSite)(self, request, extra_context)

    def i18n_javascript(self, request, extra_context=None):
        return JavaScriptCatalog.as_view(packages=LOCALE_PACKAGES)(request)

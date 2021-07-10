from django.contrib.admin import site
from django.contrib.auth import get_user_model
from django.contrib.auth import views as auth_views

from .forms import AdminPasswordResetForm, AdminSetPasswordForm


class AdminViewMixin:
    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        data.update(site.each_context(self.request))

        UserModel = get_user_model()
        data.setdefault("opts", UserModel._meta)

        return data


class AdminPasswordResetView(AdminViewMixin, auth_views.PasswordResetView):
    form_class = AdminPasswordResetForm


class AdminPasswordResetDoneView(AdminViewMixin, auth_views.PasswordResetDoneView):
    pass


class AdminPasswordResetConfirmView(AdminViewMixin, auth_views.PasswordResetConfirmView):
    form_class = AdminSetPasswordForm


class AdminPasswordResetCompleteView(AdminViewMixin, auth_views.PasswordResetCompleteView):
    pass

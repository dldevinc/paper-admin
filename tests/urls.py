from django.contrib import admin
from django.urls import include, path

from paper_admin.admin import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path(
        'admin/password_reset/',
        auth_views.AdminPasswordResetView.as_view(),
        name='admin_password_reset',
    ),
    path(
        'admin/password_reset/done/',
        auth_views.AdminPasswordResetDoneView.as_view(),
        name='password_reset_done',
    ),
    path(
        'reset/<uidb64>/<token>/',
        auth_views.AdminPasswordResetConfirmView.as_view(),
        name='password_reset_confirm',
    ),
    path(
        'reset/done/',
        auth_views.AdminPasswordResetCompleteView.as_view(),
        name='password_reset_complete',
    ),
    path('', include('app.urls')),
]

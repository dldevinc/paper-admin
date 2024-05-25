from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth.models import User

from paper_admin.admin.widgets import AdminCheckboxTree


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        widgets = {
            "user_permissions": AdminCheckboxTree,
        }


class CustomUserAdmin(UserAdmin):
    form = CustomUserChangeForm


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

from django import forms
from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin, UserAdmin
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth.models import Group, User

from paper_admin.admin.widgets import AdminCheckboxTree


class GroupAdminForm(forms.ModelForm):
    class Meta:
        widgets = {
            "permissions": AdminCheckboxTree,
        }


class CustomGroupAdmin(GroupAdmin):
    form = GroupAdminForm


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        widgets = {
            "user_permissions": AdminCheckboxTree,
        }


class CustomUserAdmin(UserAdmin):
    form = CustomUserChangeForm


admin.site.unregister(User)
admin.site.unregister(Group)
admin.site.register(User, CustomUserAdmin)
admin.site.register(Group, CustomGroupAdmin)

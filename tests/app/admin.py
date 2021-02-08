from django import forms
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from mptt.admin import MPTTModelAdmin
from solo.admin import SingletonModelAdmin

from paper_admin.admin import (
    SortableAdminMixin,
    SortableMPTTModelAdmin,
    SortableStackedInline,
    SortableTabularInline,
)
from paper_admin.forms.widgets import CustomCheckboxSelectMultiple, SwitchInput

from .models import Category, Item, SigletonExample, SubCategory, Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "name",
            ),
        }),
    )
    search_fields = ["name"]


class ItemForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = forms.ALL_FIELDS
        widgets = {
            "hidden": forms.HiddenInput,
        }

    def clean(self):
        name = self.cleaned_data.get("name")
        if name and name == "error":
            self.add_error(None, _("Some general error"))


class ItemStackedInlines(SortableStackedInline):
    form = ItemForm
    model = Item
    extra = 1
    min_num = 1
    max_num = 5
    tab = "tab4"
    readonly_fields = ("readonly", )
    verbose_name_plural = _("Stacked Items")
    classes = ("dummy-inline", )
    prepopulated_fields = {
        "slug": ("name", )
    }


class ItemTablularInlines(SortableTabularInline):
    form = ItemForm
    model = Item
    tab = "tab4"
    fields = ("readonly", "hidden", "name", "slug", "url")
    extra = 1
    readonly_fields = ("readonly",)
    verbose_name_plural = _("Tabular Items")
    prepopulated_fields = {
        "slug": ("name",)
    }


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = forms.ALL_FIELDS
        widgets = {
            "f_bool": SwitchInput,
            "f_tags1": CustomCheckboxSelectMultiple,
            "f_date2": forms.SelectDateWidget,
            "f_hidden1": forms.HiddenInput,
            "f_hidden2": forms.HiddenInput,
            "f_hidden3": forms.HiddenInput,
            "f_pass": forms.PasswordInput,
            "f_file": forms.FileInput,
        }

    def clean(self):
        f_char = self.cleaned_data.get("f_char")
        if f_char and f_char == "error":
            self.add_error(None, _("Some general error"))


@admin.register(Category)
class CategoryAdmin(SortableAdminMixin, admin.ModelAdmin):
    fieldsets = (
        (_("Related fields"), {
            "tab": "tab1",
            "classes": ("card-info", ),
            "description": _("Choose your destiny"),
            "fields": (
                "f_fk", "f_o2o", "f_fk1", "f_fk2", "f_fk3",
                "f_tags", "f_tags1", "f_tags2", "f_tags3", "f_tags4", "f_tags5",
            ),
        }),
        (_("Standard Fields"), {
            "tab": "tab2",
            "fields": (
                "f_bool", "f_bool2", "f_nullbool", "f_small_int", ("f_int_choices", "f_int_choices2", "f_int"),
                "f_bigint", "f_float", "f_decimal",
                "f_duration", "f_date", "f_date2", "f_time", "f_datetime",
                "f_char", "f_slug", "f_email", "f_pass", "f_ip", "f_text", "f_uuid", "f_url",
            )
        }),
        (_("Hidden Fields"), {
            "tab": "tab2",
            "fields": (
                "f_hidden1", "f_hidden2", "f_hidden3",
            )
        }),
        (_("ReadOnly Fields"), {
            "tab": "tab2",
            "fields": (
                "f_char_ro", "f_int_ro", "f_text_ro",
            )
        }),
        (_("File Fields"), {
            "tab": "tab3",
            "fields": (
                "f_filepath", "f_file", "f_image",
            )
        }),
    )
    tabs = [
        ("tab1", _("Related Fields")),
        ("tab2", _("Standart Fields")),
        ("tab3", _("File Fields")),
        ("tab4", _("Inlines")),
    ]
    form = CategoryForm
    list_per_page = 15
    list_max_show_all = 500
    autocomplete_fields = ["f_fk1", "f_tags5"]
    list_display = ["f_char", "f_fk", "f_int", "m2m_field", "f_date", "f_bool"]
    list_editable = ["f_int", "f_bool"]
    list_filter = ["f_bool", "f_nullbool", "f_int_choices2", "f_date", "f_fk", "f_tags", "f_int"]
    list_select_related = ["f_fk"]
    date_hierarchy = "f_date"
    search_fields = ["f_char"]
    actions_on_top = True
    actions_on_bottom = True
    filter_horizontal = ["f_tags3"]
    filter_vertical = ["f_tags4"]
    inlines = [ItemStackedInlines, ItemTablularInlines]
    raw_id_fields = ["f_fk3", "f_tags2"]
    readonly_fields = ["f_char_ro", "f_int_ro", "f_text_ro"]
    prepopulated_fields = {
        "f_slug": ("f_char", "f_int"),
    }
    radio_fields = {
        "f_fk2": 1,
        "f_int_choices2": 1,
    }

    def m2m_field(self, obj):
        return ", ".join(str(_) for _ in obj.f_tags.all())
    m2m_field.short_description = _("M2M Field")

    def get_row_classes(self, request, obj=None):
        classes = super().get_row_classes(request, obj)
        if obj.f_char.startswith("G"):
            classes.append("table-success")
        elif obj.f_char.startswith("R"):
            classes.append("table-info")
        return classes


@admin.register(SubCategory)
class SubCategoryAdmin(SortableMPTTModelAdmin, MPTTModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "parent", "category", "name", "number",
            ),
        }),
    )


@admin.register(SigletonExample)
class CategoryAdmin(SingletonModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "title",
            ),
        }),
    )

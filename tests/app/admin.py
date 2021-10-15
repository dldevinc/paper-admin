from dal import autocomplete
from django import forms
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from mptt.admin import MPTTModelAdmin
from solo.admin import SingletonModelAdmin

from paper_admin.admin.widgets import AdminCheckboxSelectMultiple, AdminSwitchInput
from paper_admin.patches.tree_queries.admin import TreeNodeModelAdmin

from .models import Category, DjangoTreeQueriesNode, Item, MPTTTree, SigletonExample, Tag


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
        if name and name.lower() == "error":
            self.add_error(None, _("Some general error"))
            self.add_error("name", _("Some field error"))
            self.add_error("name", _("One more field error"))


class ItemStackedInlines(admin.StackedInline):
    fieldsets = (
        (None, {
            "fields": (
                ("name", "age"), "slug", "url", "text", "visible", "created_at", "readonly",
                "hidden"
            )
        }),
    )
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
        "slug": ("name", "age")
    }

    def get_form_classes(self, request, obj):
        if obj.name.startswith("P"):
            return ["paper-card--success"]
        return []


class ItemTablularInlines(admin.TabularInline):
    form = ItemForm
    model = Item
    tab = "tab4"
    extra = 1
    fields = ("readonly", "hidden", "name", "age", "slug", "url", "visible")
    readonly_fields = ("readonly",)
    verbose_name_plural = _("Tabular Items")
    classes = ("dummy-inline",)
    prepopulated_fields = {
        "slug": ("name", "age")
    }

    def get_form_classes(self, request, obj):
        if obj.name.startswith("P"):
            return ["table-success"]
        return []


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = forms.ALL_FIELDS
        widgets = {
            "f_bool": AdminSwitchInput,
            "f_tags1": AdminCheckboxSelectMultiple,
            "f_date2": forms.SelectDateWidget,
            "f_hidden1": forms.HiddenInput,
            "f_hidden2": forms.HiddenInput,
            "f_hidden3": forms.HiddenInput,
            "f_pass": forms.PasswordInput,
            "f_file": forms.FileInput,

            "dal_fk": autocomplete.ModelSelect2(
                url="app:ac-tag"
            ),
            "dal_m2m": autocomplete.ModelSelect2Multiple(
                url="app:ac-tag"
            ),
        }

    def clean(self):
        f_char = self.cleaned_data.get("f_char")
        if f_char and f_char.lower() == "error":
            self.add_error(None, _("Some general error"))
            self.add_error("f_char", _("Some field error"))
            self.add_error("f_char", _("One more field error"))

        f_bool2 = self.cleaned_data.get("f_bool2")
        if not f_bool2:
            self.add_error("f_bool2", "Required")


def set_bool_action(modeladmin, request, queryset):
    queryset.update(f_bool=True)


def unset_bool_action(modeladmin, request, queryset):
    queryset.update(f_bool=False)


set_bool_action.short_description = _("Set bool for selected %(verbose_name_plural)s")
unset_bool_action.short_description = _("Unset bool for selected %(verbose_name_plural)s")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    fieldsets = (
        (_("Related fields"), {
            "tab": "tab1",
            "classes": ("paper-card--info", ),
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

        (None, {
            "tab": "tab5",
            "fields": (
                "dal_fk", "dal_m2m",
            )
        }),
    )
    tabs = [
        ("tab1", _("Related Fields")),
        ("tab2", _("Standard Fields")),
        ("tab3", _("File Fields")),
        ("tab4", _("Inlines")),
        ("tab5", _("Django Autocomplete Light")),
    ]
    actions = [
        set_bool_action,
        unset_bool_action
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

    def get_row_classes(self, request, obj):
        if obj.f_char.startswith("M"):
            return ["table-success"]
        elif obj.f_char.startswith("P"):
            return ["table-info"]
        return []


@admin.register(SigletonExample)
class SigletonExampleAdmin(SingletonModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "title",
            ),
        }),
    )


@admin.register(MPTTTree)
class MPTTTreeAdmin(MPTTModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "parent", "name",
            ),
        }),
    )


@admin.register(DjangoTreeQueriesNode)
class DjangoTreeQueriesNodeAdmin(TreeNodeModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "parent", "name",
            ),
        }),
    )

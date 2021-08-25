from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from mptt.admin import MPTTModelAdmin

from paper_admin.patches.tree_queries.admin import TreeNodeModelAdmin

from .models import (
    Company,
    CompanyIndustry,
    DjangoTreeQueriesNode,
    Industry,
    MPTTTree,
    Person,
    Staff,
)


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    ordering = ["last_name", "first_name"]
    list_display = ["last_name", "first_name"]


class StaffStackedInlines(admin.StackedInline):
    model = Staff
    extra = 0
    min_num = 1
    verbose_name_plural = _("Staff")
    sortable = "order"


@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    pass


class IndustryTabularInlines(admin.TabularInline):
    model = CompanyIndustry
    extra = 0
    min_num = 1
    verbose_name_plural = _("Industry")
    sortable = "order"


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    inlines = [StaffStackedInlines, IndustryTabularInlines]
    list_display = ["__str__", "staff_count"]
    sortable = "order"

    def staff_count(self, obj):
        return obj.staff.count()


@admin.register(MPTTTree)
class MPTTTreeAdmin(MPTTModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "parent", "title",
            ),
        }),
    )
    sortable = "position"


@admin.register(DjangoTreeQueriesNode)
class DjangoTreeQueriesNodeAdmin(TreeNodeModelAdmin):
    fieldsets = (
        (None, {
            "fields": (
                "parent", "title",
            ),
        }),
    )
    sortable = "position"

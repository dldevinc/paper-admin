# paper-admin

Custom Django admin interface based on Bootstrap 4.

[![PyPI](https://img.shields.io/pypi/v/paper-admin.svg)](https://pypi.org/project/paper-admin/)
[![Build Status](https://github.com/dldevinc/paper-admin/actions/workflows/release.yml/badge.svg)](https://github.com/dldevinc/paper-admin)
[![Software license](https://img.shields.io/pypi/l/paper-admin.svg)](https://pypi.org/project/paper-admin/)

## Requirements

-   Python >= 3.7
-   Django >= 2.2

## Table of Contents

-   [Installation](#Installation)
-   [Patches](#Patches)
-   [Badge](#Badge)
-   [Admin menu](#Admin-menu)
-   [Reorderable drag-and-drop lists](#Reorderable-drag-and-drop-lists)
-   [Form tabs](#Form-tabs)
-   [HierarchyFilter](#HierarchyFilter)
-   [Stylization](#Stylization)
    -   [Fieldset](#Fieldset)
    -   [Table rows](#Table-rows)
    -   [Inline forms](#Inline-forms)
-   [Settings](#Settings)
-   [Additional References](#Additional-References)

## Installation

Install the latest release with pip:

```shell
pip install paper-admin
```

Add `paper_admin` to your INSTALLED_APPS setting **before** `django.contrib.admin`.

```python
INSTALLED_APPS = [
    "paper_admin",
    "paper_admin.patches.dal",              # optional
    "paper_admin.patches.django_solo",      # optional
    "paper_admin.patches.mptt",             # optional
    "paper_admin.patches.logentry_admin",   # optional
    "paper_admin.patches.tree_queries",     # optional
    # ...
    "django.contrib.admin",
    # ...
]
```

## Patches

Some third-party libraries override the standard Django templates and within the `paper-admin`
interface look disfigured. To fix these, you can use the patches included in this package.

The following patches are available:

-   `paper_admin.patches.dal`<br>
    Fixes the style of the [django-autocomplete-light](https://github.com/yourlabs/django-autocomplete-light) widgets.

-   `paper_admin.patches.django_solo`<br>
    Fixes the breadcrumbs in [django-solo](https://github.com/lazybird/django-solo).

-   `paper_admin.patches.mptt`<br>
    Adaptation of [django-mptt](https://github.com/django-mptt/django-mptt).
    Adds the ability to sort tree nodes (when the `sortable` property is specified).

-   `paper_admin.patches.logentry_admin`<br>
    Fixes the filters and hides unwanted buttons in [django-logentry-admin](https://github.com/yprez/django-logentry-admin).

-   `paper_admin.patches.tree_queries`<br>
    Adds the ability to sort tree nodes for [django-tree-queries](https://github.com/matthiask/django-tree-queries).
    **It is necessary** to use the special `TreeNodeModelAdmin` class instead of the standard `ModelAdmin`:

    ```python
    # admin.py
    from django.contrib import admin
    from paper_admin.patches.tree_queries.admin import TreeNodeModelAdmin  # <--
    from .models import MyTreeNode


    @admin.register(MyTreeNode)
    class MyTreeNodeAdmin(TreeNodeModelAdmin):
        ...
        sortable = "position"
    ```

To use a patch, you need to add it to the `INSTALLED_APPS` setting.<br>
**Note**: as a rule, patches should be added **before** the libraries they fix.

## Badge

Badge is a text description of the environment to prevent confusion between the
development and production servers.

![](https://user-images.githubusercontent.com/6928240/125350052-4a28e080-e36f-11eb-8772-4d797d64863a.png)

The color and text of the badge can be changed in the `settings.py` file:

```python
PAPER_ENVIRONMENT_NAME = "development"
PAPER_ENVIRONMENT_COLOR = "#FFFF00"
```

## Admin menu

The `paper-admin` provides a way to create menus in the Django admin interface.
It allows you to define a menu tree with items that represent apps, models or custom links.
You can also define groups of items and dividers to separate them.

### Usage

To use the menu system, you need to define a menu tree in your Django project's
settings file. The menu tree is defined as a list of items, where each item can be
either a string, a dictionary or an instance of a menu item class.

The following types of menu items are available:

-   `Item`: Represents a link to a specific URL.
-   `Divider`: Represents a divider that separates items in the menu.
-   `Group`: Represents a group of items in the menu.

Here's an example of a simple menu tree:

```python
from django.utils.translation import gettext_lazy as _
from paper_admin.menu import Item, Divider


PAPER_MENU = [
    Item(
        label=_("Dashboard"),
        url="admin:index",
        icon="bi-speedometer2",
    ),
    Divider(),
    Item(
        label=_("Authentication and Authorization"),
        icon="bi-person-circle",
        children=[
            Item(
                model="User",
                icon="bi-lg bi-people",
            ),
            Item(
                model="Group",
                icon="bi-lg bi-people-fill",
            ),
        ]
    )
]
```

### `Item`

The `Item` class represents a link to a specific URL. You can use it to create links
to Django admin pages, external websites or any other URL.

Properties:

-   `app`: A string representing the name of the Django app that the menu item
    will point to. If this is provided, the URL of the menu item will point to the app
    index page.
-   `model`: A string representing the name of the Django model that the menu
    item will point to. If this is provided, the URL of the menu item will point
    to the model list page.
-   `label`: A string representing the text that will be displayed in the menu item.
-   `url`: A string representing the URL that the menu item will point to.
-   `icon`: The CSS classes to use for the icon of the menu item.
-   `perms`: A list of permission strings that are required for the user to see this
    item in the menu. If this property is not provided, the item will be visible
    to all users.
-   `classes`: A string of additional CSS classes to add to the menu item.
-   `target`: The target attribute to use for the link.
-   `children`: An optional list of Item or Group instances representing sub-items of the menu item.

The `app` and `model` parameters cannot be set simultaneously. However, you must
specify at least one of the following parameters: `app`, `model`, or `label`.

Example usage:

```python
from django.utils.translation import gettext_lazy as _
from paper_admin.menu import Item


PAPER_MENU = [
    # Menu item with a specified label and URL
    Item(
        label=_("Dashboard"),
        url="admin:index",
        icon="bi-speedometer2",
    ),

    # Menu for the 'auth' app. Child items will be automatically generated
    # from the app's models.
    Item(
        app="auth"
    ),

    # App 'app' with a specified list of models.
    # The app's name is implicitly added to the model names.
    Item(
        app="app",
        icon="bi-house-fill",
        children=[
            "Widgets",
            "Message",
            "Book",
        ]
    ),

    # Specify a model from a specific app as a child item
    Item(
        label=_("Logs"),
        icon="bi-clock-history",
        perms="admin.view_logentry",
        children=[
            "admin.LogEntry"
        ]
    ),

    # Add CSS classes and a target attribute to a link
    Item(
        label="Google",
        url="https://google.com/",
        icon="bi-google",
        classes="text-warning",
        target="_blank",
    )
]
```

![image](https://user-images.githubusercontent.com/6928240/232227638-cc952405-051e-40a2-96ac-e1df84079d40.png)

When defining permissions for menu items using the `perms` parameter, you can use
the special values `PAPER_MENU_SUPERUSER_PERMISSION` (default is `superuser`)
and `PAPER_MENU_STAFF_PERMISSION` (default is `staff`) to restrict access to
superusers and staff members respectively.

Example:

```python
from paper_admin.menu import Item


PAPER_MENU = [
    Item(
        app="payments",
        icon="bi-money",
        perms=["staff"],
        children=[
            Item(
                model="Payment",
                perms=["superuser"],
            ),
            Item(
                model="Invoice",
            ),
        ]
    ),
]
```

### Divider

The `Divider` class is used to add a horizontal line to separate items in the menu
tree. It doesn't have any properties or methods, it's simply used to visually group
items together.

```python
from django.utils.translation import gettext_lazy as _
from paper_admin.menu import Item, Divider


PAPER_MENU = [
    Item(
        label=_("Dashboard"),
        url="#",
    ),
    Divider(),
    Item(
        label=_("About Us"),
        url="#",
    ),
    Item(
        label=_("Blog"),
        url="#",
    ),
    Item(
        label=_("Contacts"),
        url="#",
    ),
    Divider(),
    Item(
        label=_("Users"),
        url="#",
    ),
    Item(
        label=_("Logs"),
        url="#",
    ),
]
```

![image](https://user-images.githubusercontent.com/6928240/232309685-d6315de8-a39a-4c30-9862-26d139ae8008.png)

### Group

The `Group` class represents a group of menu items. It can be used to group related
items together under a common heading.

```python
from django.utils.translation import gettext_lazy as _
from paper_admin.menu import Item, Group


PAPER_MENU = [
    Item(
        label=_("Dashboard"),
        url="#",
    ),
    Group(
        label=_("Content"),
        children=[
            Item(
                label=_("About Us"),
                url="#",
            ),
            Item(
                label=_("Blog"),
                url="#",
            ),
        ]
    ),
    Group(
        label=_("Admin Area"),
        perms=["superuser"],
        children=[
            Item(
                label=_("Backups"),
                url="#",
            ),
            Item(
                label=_("Logs"),
                url="#",
            ),
        ]
    ),
]
```

![image](https://user-images.githubusercontent.com/6928240/232309872-3502acbf-68ef-4e38-a7b3-9507597466e6.png)

## Reorderable drag-and-drop lists

The `paper-admin` package provides the ability to reorder items in lists using
drag-and-drop. To enable this feature, you need to set the `sortable` property of
the model's `ModelAdmin` to the name of the field that stores the order.

```python
# models.py
from django.db import models


class Company(models.Model):
    # ...
    position = models.IntegerField(
        "position",
        default=0
    )
```

```python
# admin.py
from django.contrib import admin


class CompanyAdmin(admin.ModelAdmin):
    # ...
    sortable = "position"
```

https://user-images.githubusercontent.com/6928240/125331456-0f1bb280-e359-11eb-8b17-b04be4b1e62c.mp4

<br>
The sorting is performed using AJAX and is saved to the database automatically.

### Reorderable inline forms

The `paper-admin` package also provides the ability to reorder inline forms in
the same way. But in this case, the sorting is not saved to the database automatically.

```python
from django.contrib import admin


class StaffInline(admin.StackedInline):
    # ...
    sortable = "position"


class IndustryInline(admin.TabularInline):
    # ...
    sortable = "position"
```

https://user-images.githubusercontent.com/6928240/125331956-b6004e80-e359-11eb-8422-832dfe37bb6c.mp4

<br>
The sorting is compatible with [django-mptt](https://github.com/django-mptt/django-mptt)
(if the `paper_admin.patches.mptt` patch is added to `INSTALLED_APPS`).
You can only change the order of elements that have the same parent and are at the same
level of nesting:

https://user-images.githubusercontent.com/6928240/125340277-55760f00-e363-11eb-94d4-49a978cb7ae4.mp4

## Form tabs

The `paper-admin` provides a way to divide forms into sections. Sections are
represented as tabs, which makes it easier to navigate between them.

To use this feature, you need to set the `tabs` property of the model's
`ModelAdmin` to a list of tab definitions.

```python
from django.contrib import admin
from django.utils.translation import gettext_lazy as _


class TablularInline(admin.TabularInline):
    tab = 'inlines'


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            'tab': 'related-fields',
            'fields': (
                # ...
            ),
        }),
        (None, {
            'tab': 'standard-fields',
            'fields': (
                # ...
            )
        }),
        (None, {
            'tab': 'file-fields',
            'fields': (
                # ...
            )
        }),
    )
    tabs = [
        ('related-fields', _('Related fields')),
        ('standard-fields', _('Standard Fields')),
        ('file-fields', _('File Fields')),
        ('inlines', _('Inlines')),
    ]
    inlines = (TablularInline, )
```

https://user-images.githubusercontent.com/6928240/226703428-c9413de1-42c1-4178-b75f-37412925f18f.mp4

<br>
Tabs can also be dynamically generated by the `get_tabs()` method:

```python
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Page


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    def get_tabs(self, request, obj=None):
        return [
            ('general', _('General')),
            ('content', _('Content')),
            ('seo', _('SEO')),
        ]
```

## HierarchyFilter

`HierarchyFilter` is a special type of filter that can be used to filter objects by a
hierarchical model field. It is similar to the `date_hierarchy` filter, but it works
with any hierarchical model field.

```python
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from paper_admin.admin.filters import HierarchyFilter
from .models import Group, Message


class GroupFilter(HierarchyFilter):
    title = _("Filter by group")
    parameter_name = "group"

    def lookups(self, changelist):
        return (
            (pk, name)
            for pk, name in Group.objects.values_list("pk", "name")
        )

    def queryset(self, request, queryset):
        value = self.value()
        if not value:
            return queryset

        return queryset.filter(group__in=value)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    # ...
    list_filters = [GroupFilter]
```

Result:

![image](https://user-images.githubusercontent.com/6928240/229168174-a9c32ec8-f87a-4ec9-a875-105eeae61f06.png)

## Stylization

### Fieldset

Django [provides](https://docs.djangoproject.com/en/4.0/ref/contrib/admin/#django.contrib.admin.ModelAdmin.fieldsets)
a way to add a custom CSS classes to the fieldsets in the admin interface.

To use this feature, specify the `classes` parameter in the `ModelAdmin.fieldsets`
attribute:

```python
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    fieldsets = (
        (_("Info Section"), {
            "classes": ("paper-card--info", ),
            "description": _("Description for the fieldset"),
            "fields": (
                # ...
            ),
        }),
        (_("Success Section"), {
            "classes": ("paper-card--success",),
            "fields": (
                # ...
            )
        }),
        (_("Danger Section"), {
            "classes": ("paper-card--danger",),
            "fields": (
                # ...
            )
        }),
    )
```

![](https://user-images.githubusercontent.com/6928240/125337870-8f91e180-e360-11eb-9b19-7f903ab30464.png)

### Table rows

You can use the `get_row_classes` method of the `ModelAdmin`
class to add custom classes to the rows in the list view.

```python
from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    def get_row_classes(self, request, obj):
        if obj.status == "success":
            return ["table-success"]
        elif obj.status == "failed":
            return ["table-danger"]
        return []
```

![image](https://user-images.githubusercontent.com/6928240/225705910-4f1309e1-93e3-456a-b9d0-f01748faec7b.png)

### Inline forms

You can use the `get_form_classes` method of the `ModelAdmin` class
to add custom classes to the inline forms:

```python
from django.contrib import admin


class StackedInline(admin.StackedInline):
    def get_form_classes(self, request, obj):
        if obj.status == "success":
            return ["paper-card--success"]
        elif obj.status == "failed":
            return ["paper-card--danger"]
        return []


class TablularInlines(admin.TabularInline):
    def get_form_classes(self, request, obj):
        if obj.status == "success":
            return ["table-success"]
        elif obj.status == "failed":
            return ["table-danger"]
        return []
```

![image](https://user-images.githubusercontent.com/6928240/225713947-34e29927-b629-4b9a-bf6e-56ec8948de7e.png)
![image](https://user-images.githubusercontent.com/6928240/225714321-87a33c52-65d8-4175-a118-cb751b92ebb8.png)

## Settings

`PAPER_FAVICON`<br>
The path to the favicon for the admin interface.<br>
Default: `"paper_admin/dist/assets/default_favicon.png"`

`PAPER_ENVIRONMENT_NAME`<br>
The text of the environment badge.<br>
Default: `""`

`PAPER_ENVIRONMENT_COLOR`<br>
The color of the environment badge.<br>
Default: `""`

`PAPER_MENU`<br>
A list of menu items. See [Admin menu](#Admin-menu) for details.<br>
Default: `None`

`PAPER_MENU_DIVIDER`<br>
A string representing the menu item divider.<br>
Default: `"-"`

`PAPER_MENU_STAFF_PERMISSION`<br>
The special permission string that allows access to the menu item for staff users.<br>
Default: `"staff"`

`PAPER_MENU_SUPERUSER_PERMISSION`<br>
The special permission string that allows access to the menu item for superusers.<br>
Default: `"superuser"`

`PAPER_MENU_COLLAPSE_SINGLE_CHILDS`<br>
Whether to collapse a menu item if it has only one child.<br>
Default: `True`

`PAPER_DEFAULT_TAB_NAME`<br>
The name of the tab to activate in the form by default.<br>
Default: `"general"`

`PAPER_DEFAULT_TAB_TITLE`<br>
The title of the tab to activate in the form by default.<br>
Default: `_("General")`

`PAPER_LOCALE_PACKAGES`<br>
The list of packages to search for translation strings.<br>
Default: `["paper_admin", "django.contrib.admin"]`

`PAPER_NONE_PLACEHOLDER`<br>
The placeholder text for the "None" option in the filters.<br>
Default: `␀`

## Additional References

-   [Modals](docs/modals.md)

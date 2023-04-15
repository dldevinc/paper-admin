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

Некоторые сторонние библиотеки переопределяют стандартные
шаблоны Django и в рамках интерфейса `paper_admin`
выглядят инородно. По этой причине (а также для внедрения
дополнительного функционала) применяются патчи.

В состав `paper_admin` включены следующие патчи:

-   `paper_admin.patches.dal`<br>
    Исправляет стили виджетов [django-autocomplete-light](https://github.com/yourlabs/django-autocomplete-light)

-   `paper_admin.patches.django_solo`<br>
    Исправляет хлебные крошки в [django-solo](https://github.com/lazybird/django-solo).

-   `paper_admin.patches.mptt`<br>
    Адаптация [django-mptt](https://github.com/django-mptt/django-mptt).
    Добавляет возможность сортировки узлов дерева (при указании свойства `sortable`).

-   `paper_admin.patches.logentry_admin`<br>
    Исправление фильтров и скрытие ненужных кнопок в [django-logentry-admin](https://github.com/yprez/django-logentry-admin).

-   `paper_admin.patches.tree_queries`<br>
    Добавление возможности сортировки узлов дерева для [django-tree-queries](https://github.com/matthiask/django-tree-queries).
    **Необходимо** использовать специальный класс `TreeNodeModelAdmin` вместо `ModelAdmin`:

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

**Note**: как правило, патчи должны быть указаны в `INSTALLED_APPS` **до** библиотек,
которые они исправляют.

## Badge

Полоса с текстом в сайдбаре.

![](https://user-images.githubusercontent.com/6928240/125350052-4a28e080-e36f-11eb-8772-4d797d64863a.png)

Её основное предназначение - визуально обозначить окружение, в котором работает
административный интерфейс. Так вы не перепутаете сервер разработки с продашеном.

Цвет полосы и текст устанавливаются в `settings.py`:

```python
PAPER_ENVIRONMENT_NAME = "development"
PAPER_ENVIRONMENT_COLOR = "#FFFF00"
```

## Admin menu

![image](https://user-images.githubusercontent.com/6928240/203797839-c2040aa0-e400-4e10-98c4-57fe8c062a9e.png)

Меню в сайдбаре настраивается путем заполнения списка `PAPER_MENU`
в `settings.py`:

```python
from django.utils.translation import gettext_lazy as _
from paper_admin.menu import Item, Divider

PAPER_MENU = [
    # Пункт меню для главной страницы
    Item(
        label=_("Dashboard"),
        url="admin:index",
        icon="bi-lg bi-mb bi-speedometer2",
    ),

    # Приложение app с явно заданным списком моделей
    Item(
        app="app",
        icon="bi-lg bi-mb bi-house-fill",
        children=[
            "Tag",
            "Category",
            "SubCategory",
        ]
    ),

    # Линия-разделитель
    Divider(),

    # Приложение auth. Перечень моделей создаётся автоматически.
    Item(app="auth"),

    # Модель LogEntry из приложения admin
    Item(
        label=_("Logs"),
        icon="bi-lg bi-mb bi-clock-history",
        perms="admin.view_logentry",
        children=[
            # Модель с явно указанным приложением
            "admin.LogEntry"
        ]
    )
]
```

Каждый пункт меню определяется с помощью экземпляра класса `Item`.

Для пунктов меню доступны следующие параметры:
* `app` - Приложение, для которого будет создан пункт меню. Определяет имя пункта меню
  если `label` не задан. Неявно добавляется к именам моделей, указанным в дочерних пунктах.
* `model` - Модель, для которой будет создан пункт меню в формате `app_label.model_name`,
  либо просто `model_name`, если `app` был указан в пункте меню-родителе. Определяет имя 
  и URL пункта меню если `label` и `url` не заданы.
* `label` - Название пункта меню.
* `url` - URL пункта меню. Если не указан, автоматически определяется по `app` или `model`.
* `icon` - CSS-классы иконки пункта меню из [Bootstrap Icons](https://icons.getbootstrap.com/).
* `perms` - Права доступа, необходимые для показа пункта меню.
* `classes` - CSS-классы для пункта меню.
* `target` - Атрибут `target` для ссылки. Допустимые значения: `_blank`, `_self`.
* `children` - Список дочерних пунктов меню.

Не допускается одновременное задание параметров `app` и `model`. 
Однако, необходимо указать хотя бы один из параметров `app`, `model` или `label`.

В качестве значения для параметра `children` можно передать список строк с именами 
моделей, или список экземпляров класса `Item`. Если `children` не указан, а параметр 
`app` задан, то дочерние пункты будут автоматически созданы из всех моделей приложения.

В качестве значения для параметра `perms` можно передать строку или список строк с
именами прав доступа, функцию или значение `PAPER_MENU_SUPERUSER_PERMISSION`
(по умолчанию `superuser`) или `PAPER_MENU_STAFF_PERMISSION` (по умолчанию `staff`).

Пример:

```python
Item(
    label="My item",
    url="https://example.com/",
    icon="bi-lg bi-rocket-takeoff",
    classes="text-warning",
    target="_blank",
    perms=["app.view_model1", "app.view_model2"],
    children=[
        "Model1",
        "Model2",
        Item(
            label="Subitem",
            url="https://example.com/",
            icon="bi-lg bi-gear-fill"
        )
    ]
)
```

## Reorderable drag-and-drop lists

Для того, чтобы экземпляры модели можно было сортировать в интерфейсе администратора,
необходимо выполнить два условия.

1. Добавить в модель _числовое_ поле, которое будет хранить порядковый номер.

    ```python
    # models.py

    from django.db import models

    class MyModel(models.Model):
        position = models.IntegerField(
            "position",
            default=0
        )
    ```

2. Указать название этого поля в свойстве `sortable` соответствующего
   подкласса `ModelAdmin`:

    ```python
    # admin.py

    from django.contrib import admin

    class MyModelAdmin(admin.ModelAdmin):
        sortable = "position"
        # ...
    ```

Результат:

https://user-images.githubusercontent.com/6928240/125331456-0f1bb280-e359-11eb-8b17-b04be4b1e62c.mp4

Сохранение сортировки происходит через AJAX-запрос.

Таким же путём можно включить сортировку инлайн-форм, но в этом случае сортировка происходит
с помощью кнопок и сохраняется вместе со всей страницей при нажатии кнопки "Save":

```python
from django.contrib import admin

class TablularInline(admin.TabularInline):
    sortable = "position"
    # ...
```

Результат:

https://user-images.githubusercontent.com/6928240/125331956-b6004e80-e359-11eb-8422-832dfe37bb6c.mp4

Сортировка `paper-admin` совместима с [django-mptt](https://github.com/django-mptt/django-mptt)
(если в `INSTALLED_APPS` добавлен патч `paper_admin.patches.mptt`).
Менять местами можно только те элементы, которые имеют общего родителя и находятся на одном уровне
вложенности:

https://user-images.githubusercontent.com/6928240/125340277-55760f00-e363-11eb-94d4-49a978cb7ae4.mp4

## Form tabs

Форму добавления/редактирования объекта можно разделить на вкладки.
Список вкладок указывается в атрибуте `tabs`:

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

Результат:

https://user-images.githubusercontent.com/6928240/226703428-c9413de1-42c1-4178-b75f-37412925f18f.mp4

<br>
Вкладки можно добавлять динамически, с помощью метода `get_tabs`:

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

`HierarchyFilter` - это базовый класс для построения фильтров, подобных тому,
что создаётся с помощью свойства `ModelAdmin.date_hierarcy`.

Пример:

```python
from paper_admin.admin.filters import HierarchyFilter
from django.utils.translation import gettext_lazy as _


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
```

Результат:

![image](https://user-images.githubusercontent.com/6928240/229168174-a9c32ec8-f87a-4ec9-a875-105eeae61f06.png)

## Stylization

### Fieldset

Django [даёт возможность](https://docs.djangoproject.com/en/4.0/ref/contrib/admin/#django.contrib.admin.ModelAdmin.fieldsets)
указать произвольные CSS-классы и описание для любого fieldset.
`paper-admin` предоставляет набор готовых CSS-классов для стилизации fieldset:

-   `paper-card--primary`
-   `paper-card--secondary`
-   `paper-card--info`
-   `paper-card--danger`
-   `paper-card--success`
-   `paper-card--warning`

```python
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
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

Результат:

![](https://user-images.githubusercontent.com/6928240/125337870-8f91e180-e360-11eb-9b19-7f903ab30464.png)

### Table rows

Для каждого ряда таблицы вызывается метод `get_row_classes`, который должен вернуть
список CSS-классов, которые будут добавлены к тэгу `<tr>`.

```python
from django.contrib import admin
from .models import Page

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):

    def get_row_classes(self, request, obj):
        if obj.status == "success":
            return ["table-success"]
        elif obj.status == "failed":
            return ["table-danger"]
        return []
```

Результат:

![image](https://user-images.githubusercontent.com/6928240/225705910-4f1309e1-93e3-456a-b9d0-f01748faec7b.png)

### Inline forms

Inline-формам тоже можно назначить произвольные CSS-классы с помощью метода
`get_form_classes`:

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

Результат:

![image](https://user-images.githubusercontent.com/6928240/225713947-34e29927-b629-4b9a-bf6e-56ec8948de7e.png)
![image](https://user-images.githubusercontent.com/6928240/225714321-87a33c52-65d8-4175-a118-cb751b92ebb8.png)

## Settings

`PAPER_FAVICON`<br>
Путь к favicon-файлу, который будет использоваться в интерфейсе админиcтратора.<br>
Default: `"paper_admin/dist/assets/default_favicon.png"`

`PAPER_ENVIRONMENT_NAME`<br>
Текст на бейжде в сайдбаре.<br>
Default: `""`

`PAPER_ENVIRONMENT_COLOR`<br>
Цвет фона бейджа.<br>
Default: `""`

`PAPER_MENU`<br>
Меню.<br>
Default: `None`

`PAPER_MENU_DIVIDER`<br>
При встрече указанной строки в списке пунктов `PAPER_MENU`,
на её место будут вставлен горизонтальный разделитель.<br>
Default: `"-"`

`PAPER_MENU_STAFF_PERMISSION`<br>
Ключевое слово в параметре `perms` пункта меню `PAPER_MENU`,
которое указывает, что текущий пункт меню должен быть показан
только при условии, что у пользователя установлен флаг `is_staff`.<br>
Default: `"staff"`

`PAPER_MENU_SUPERUSER_PERMISSION`<br>
Ключевое слово в параметре `perms` пункта меню `PAPER_MENU`,
которое указывает, что текущий пункт меню должен быть показан
только при условии, что у пользователя установлен флаг `is_superuser`.<br>
Default: `"superuser"`

`PAPER_MENU_COLLAPSE_SINGLE_CHILDS`<br>
При значении `True`, те пункты меню, которые содержат единственный
подпункт, не будут отображаться как выпадающие списки. Вместо этого
они сразу будут вести на страницу, указанную в подпункте.<br>
Default: `True`

`PAPER_DEFAULT_TAB_NAME`<br>
Алиас вкладки по-умолчанию.<br>
Default: `"general"`

`PAPER_DEFAULT_TAB_TITLE`<br>
Заголовок вкладки по-умолчанию.<br>
Default: `_("General")`

`PAPER_LOCALE_PACKAGES`<br>
Список модулей, из которых должны загружаться переводы
для `JavaScriptCatalog` интерфейса администратора.<br>
Default: `["paper_admin", "django.contrib.admin"]`

`PAPER_NONE_PLACEHOLDER`<br>
Значение, представляющее `None` в фильтрах интерфейса администратора.<br>
Default: `␀`

## Additional References

-   [Modals](docs/modals.md)

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
    -   [Menu item permissions](#Menu-item-permissions)
-   [Reorderable drag-and-drop lists](#Reorderable-drag-and-drop-lists)
-   [Form tabs](#Form-tabs)
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

PAPER_MENU = [
    dict(       # Пункт меню для главной страницы
        label=_("Dashboard"),
        url="admin:index",
        icon="fa fa-fw fa-lg fa-area-chart",
    ),
    dict(       # Приложение app с перечнем его моделей
        app="app",
        icon="fa fa-fw fa-lg fa-home",
        models=[
            "Tag",
            "Category",
            "SubCategory",
        ]
    ),
    "-",        # Разделитель
    "auth",     # Приложение auth
    dict(       # Модель LogEntry из приложения admin
        label=_("Logs"),
        icon="fa fa-fw fa-lg fa-history",
        perms="admin.view_logentry",
        models=[
            "admin.LogEntry"
        ]
    ),
]
```

Пункт меню может быть задан одним из четырех способов:

-   Имя приложения.<br>

    ```python
    PAPER_MENU = [
        # ...
        "app",
        # ...
    ]
    ```

    Все модели выбранного приложения образуют подменю. Порядок моделей Django
    определяет автоматически.

-   Путь к модели.<br>

    ```python
    PAPER_MENU = [
        # ...
        "app.Tag",
        # ...
    ]
    ```

    Создаст пункт меню с заголовком, соответствующим названию модели и
    ссылающийся на страницу changelist.

-   Строка-разделитель.<br>

    ```python
    PAPER_MENU = [
        # ...
        "-",
        # ...
    ]
    ```

    Добавляет горизонтальную линию. С помощью разделителей можно визуально группировать пункты меню.

-   Словарь.<br>

    ```python
    from django.urls import reverse_lazy
    from django.utils.translation import gettext_lazy as _

    PAPER_MENU = [
        # ...
        dict(
          app="app",
          icon="fa fa-fw fa-lg fa-home",
          models=[
              "Tag",        # Модель app.Tag
              "Category",   # Модель app.Category
              dict(         # Произвольный вложенный пункт
                  label=_("Index"),
                  url=reverse_lazy("admin:app_list", kwargs={
                      "app_label": "app"
                  })
              ),
          ]
        ),
        # ...
    ]
    ```

    Самый гибкий способ создания пункта меню. В словаре можно явным образом
    указать название пункта меню, его URL, иконку, CSS-классы и вложенные
    пункты. Вложенные пункты тоже могут быть заданы с помощью словаря.

При использовании словаря можно указать следующие ключи:

-   `label`: `str` - заголовок пункта меню.
-   `url`: `str` - URL или имя URL-шаблона (например, `app:index`).
-   `icon`: `str` - CSS-классы иконки (используется FontAwesome v4).
-   `classes`: `str` - CSS-классы пункта меню.
-   `perms`: `str/list/callable` - права, необходимые для отображения пункта.
    Для определения суперюзера и сотрудников, можно использовать специальные
    значения `superuser` и `staff` соответственно.
-   `app`: `str` - имя приложения. Неявно добавляется к именам моделей,
    указанным в пункте `models`.
-   `models`: `list/dict` - дочерние пункты меню. Содержит список имен моделей
    приложения или вложенных пунктов, которые можно задать в виде словаря.

### Menu item permissions

С помощью параметра `perms` можно указать названия прав (Django permissions),
которые должен иметь пользователь, чтобы увидеть соответствующий пункт меню.

> На доступность страниц параметр `perms` никак не влияет! Если пользователь знает
> адрес страницы или ссылка на неё имеется где-то ещё, то пользователь сможет
> на неё зайти!

```python
PAPER_MENU = [
    # Пункт меню приложения app увидят только сотрудники (staff),
    # имеющие право на изменение модели `app.Tag`.
    dict(
        app="app",
        perms=["staff", "app.change_tag"],
        models=[
            "Tag",
        ]
    )
]
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


class TablularInlines(admin.TabularInline):
    # имя вкладки, на которой должен быть отображен формсет
    tab = 'inlines-tab'


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    fieldsets = (
        (_('First Section'), {
            'tab': 'common-tab',
            'fields': (
                # ...
            ),
        }),
        (_('Second Section'), {
            'tab': 'common-tab',
            'fields': (
                # ...
            )
        }),
        (_('Links'), {
            'tab': 'links-tab',
            'fields': (
                # ...
            )
        }),
    )
    tabs = [
        ('common-tab', _('General')),
        ('links-tab', _('Links')),
        ('inlines-tab', _('Inlines')),
    ]
    inlines = (TablularInlines, )
```

Результат:

https://user-images.githubusercontent.com/6928240/125336032-4e003700-e35e-11eb-8399-9cff90ea7aca.mp4

Вкладки можно добавлять динамически, с помощью метода `get_tabs`:

```python
from django.contrib import admin
from .models import Page

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    def get_tabs(self, request, obj=None):
        return [
            # ...
        ]
```

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

`PAPER_MENU_PERM_STAFF`<br>
Ключевое слово в параметре `perms` пункта меню `PAPER_MENU`,
которое указывает, что текущий пункт меню должен быть показан
только при условии, что у пользователя установлен флаг `is_staff`.<br>
Default: `"staff"`

`PAPER_MENU_PERM_SUPERUSER`<br>
Ключевое слово в параметре `perms` пункта меню `PAPER_MENU`,
которое указывает, что текущий пункт меню должен быть показан
только при условии, что у пользователя установлен флаг `is_superuser`.<br>
Default: `"superuser"`

`PAPER_MENU_HIDE_SINGLE_CHILD`<br>
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

## Additional References

-   [Modals](docs/modals.md)

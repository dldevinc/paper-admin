# paper-admin
Custom Django admin interface.

[![PyPI](https://img.shields.io/pypi/v/paper-admin.svg)](https://pypi.org/project/paper-admin/)
[![Build Status](https://travis-ci.org/dldevinc/paper-admin.svg?branch=master)](https://travis-ci.org/dldevinc/paper-admin)

## Requirements
* Python >= 3.6
* Django >= 2.1

## Installation
Add `paper_admin` to your INSTALLED_APPS setting **before** `django.contrib.admin`.
```python
INSTALLED_APPS = [
    'paper_admin',
    'paper_admin.patches.dal',          # optional
    'paper_admin.patches.django_solo',  # optional
    'paper_admin.patches.mptt',         # optional
    'paper_admin.patches.post_office',  # optional
    # ...
    'django.contrib.admin',
    # ...
]
```

## Patches
Некоторые сторонние библиотеки переопределяют стандартные 
шаблоны Django и в рамках интерфейса `paper_admin` 
выглядят инородно. Поэтому приходится применять патчи.

В состав `paper_admin` включены следующие патчи:

* `paper_admin.patches.dal`<br>
  Исправляет стили виджетов [django-autocomplete-light](https://github.com/yourlabs/django-autocomplete-light)

* `paper_admin.patches.django_solo`<br>
  Исправляет хлебные крошки в [django-solo](https://github.com/lazybird/django-solo).

* `paper_admin.patches.mptt`<br>
  Адаптация [django-mptt](https://github.com/django-mptt/django-mptt).
  Предоставляет класс `SortableMPTTModelAdmin` для оформления сортируемого дерева.

* `paper_admin.patches.post_office`<br>
  Исправление виджета списка email адресов в [django-post_office](https://github.com/ui/django-post_office)  

**Note**: как правило, патчи должны быть указаны в `INSTALLED_APPS` **до** библиотек, 
которые они исправляют.

## Sort table of content with drag and drop

Для того, чтобы экземпляры модели можно было сортировать в интерфейсе администратора,
необходимо выполнить два условия.

1. Добавить в модель *числовое* поле, которое будет хранить 
   порядковый номер.

```python
from django.db import models

class MyModel(models.Model):
    order = models.IntegerField(
        "order", 
        default=0,
        editable=False  # опционально
    )
```

2. Указать название поля в свойстве `sortable`. Это работает как 
   с инлайн-формами, так и с подклассами `ModelAdmin`.

```python
from django.contrib import admin

class TablularInline(admin.TabularInline):
    sortable = 'order'
    # ...


class MyModelAdmin(admin.ModelAdmin):
    sortable = 'order'
    # ...
```


## Tabs
Поля формы можно разделить на вкладки:

```python
class TablularInlines(admin.TabularInline):
    tab = 'inlines-tab'


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    fieldsets = (
        (_('First Section'), {
            'tab': 'common-tab',
            'classes': ('paper-card--info', ),
            'description': _('Some fieldset help text'),
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

## Colorize table rows
```python
@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    def get_row_classes(self, request, obj):
        classes = super().get_row_classes(request, obj)
        if obj.status == 'OK':
            classes.append('table-success')
        return classes
```

## Additional widgets
### AdminSwitchInput
Стилизованый чекбокс.

![](http://joxi.net/ZrJJgW9iMDbQ5r.png)

## Menu
Меню в сайдбаре настраивается путем заполнения списка 
`PAPER_MENU` в `settings.py`.

```python
PAPER_MENU = [
    dict(
        label=_('Dashboard'),
        url='admin:index',
        icon='fa fa-fw fa-lg fa-area-chart',
    ),
    dict(
        app='app',
        icon='fa fa-fw fa-lg fa-home',
        models=[
            'Tag',
            'Category',
            'SubCategory',
        ]
    ),
    '-',
    'auth',
    'sites',
]
```

Каждый элемент списка `PAPER_MENU` может быть представлен 
одним из четырех видов:
* имя приложения (app_label)
* путь к модели (app_label.model_name)
* словарь
* строка-разделитель ("-")


Доступные ключи для формирования пункта меню с помощью словаря:
* `label`: `str`                - заголовок пункта меню
* `url`: `str`                  - URL или имя URL-шаблона (например `app:index`)
* `icon`: `str`                 - CSS-классы иконки
* `classes`: `str`              - CSS-классы пункта меню
* `perms`: `str/list/callable`  - права, необходимые для отображения пункта.
    Для определения суперюзера и сотрудников, можно использовать
    специальные значения `superuser` и `staff`.
* `app`: `str`                  - имя приложения. Добавляется к именам моделей в `models`.
* `models`: `list/dict`         - дочерние пункты меню. 
  Может содержать имена моделей или пункты меню.

#### Пример 1. Собственный пункт меню.
```python
from django.urls import reverse_lazy

PAPER_MENU = [
    dict(
      app="app",
      icon="fa fa-fw fa-lg fa-home",
      models=[
          dict(
              label=_("Index"),
              url=reverse_lazy("admin:app_list", kwargs={
                    "app_label": "app"
              })
          ),
          "Tag",
          "Category",
      ]
    )
]
```

#### Пример 2. Отображение пункта модели только при наличии указанных прав.
```python
PAPER_MENU = [
    dict(
        app="app",
        icon="fa fa-fw fa-lg fa-home",
        models=[
            "Tag",
            dict(
                label=_("Category"),
                url="admin:app_category_changelist",
                perms=["app.add_category", "app.view_category"]
            ),
        ]
    )
]
```


## Settings
| Option | Description | Example value |
| --- | --- | --- |
| `PAPER_ENVIRONMENT_NAME`  | Текст на плашке текущего окружения    | 'development'         |
| `PAPER_ENVIRONMENT_COLOR` | Цвет фона плашки текущего окружения   | '#FFFF00'             |
| `PAPER_MENU`              | Меню в сайдбаре                       | |

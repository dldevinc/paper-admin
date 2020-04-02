# paper-admin

![](http://dl3.joxi.net/drive/2019/08/28/0025/1750/1701590/90/00584b8abc.png)

![](http://dl3.joxi.net/drive/2019/08/28/0025/1750/1701590/90/72f0b476ae.png)

## Requirements
* Python (3.5, 3.6, 3.7)
* Django (2.1, 2.2)

## Installation
Add `paper_admin` to your INSTALLED_APPS setting **before** `django.contrib.admin`.
```python
INSTALLED_APPS = [
    'paper_admin',
    'paper_admin.patches.django_solo',  # optional
    'paper_admin.patches.mptt',         # optional
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

* `paper_admin.patches.django_solo`
    Исправляет хлебные крошки в [django-solo](https://github.com/lazybird/django-solo).

* `paper_admin.patches.mptt`
    Адаптация [django-mptt](https://github.com/django-mptt/django-mptt).
    Предоставляет класс `SortableMPTTModelAdmin` для оформления сортируемого дерева.

**Note**: как правило, патчи должны быть указаны в `INSTALLED_APPS` **до** библиотек, 
которые они исправляют.

## Sortable admin objects

```python
from paper_admin.admin.sortable import SortableAdminMixin, SortableTabularInline


class TablularInline(SortableTabularInline):
    sortable = 'order'
    # ...


class MyModelAdmin(SortableAdminMixin, admin.ModelAdmin):
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
            'classes': ('card-info', ),
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

![](http://dl3.joxi.net/drive/2019/08/28/0025/1750/1701590/90/5cc83f8e98.png)

## Additional widgets
### SwitchInput
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
* `label`: `str`      - заголовок пункта меню
* `url`: `str`        - ссылка или именованный URL
* `icon`: `str`       - CSS-классы иконки
* `classes`: `str`    - CSS-классы пункта меню
* `perms`: `str/list` - права, необходимые для отображения пункта (либо строка "superuser")
* `app`: `str`        - имя приложения. Добавляется к именам моделей в models
* `models`: `list`    - дочерние пункты меню. Может содержать имена моделей или вложенные словари.


## Settings
| Option | Description | Example value |
| --- | --- | --- |
| `PAPER_SITE_TITLE`        | Базовая часть тэга <title>            | 'Django site admin'   |
| `PAPER_SITE_HEADER`       | Заголовок в сайдбаре                  | 'Apple pie shop'      |
| `PAPER_ENVIRONMENT_NAME`  | Текст на плашке текущего окружения    | 'development'         |
| `PAPER_ENVIRONMENT_COLOR` | Цвет фона плашки текущего окружения   | '#FFFF00'             |
| `PAPER_SUPPORT_PHONE`     | Контактный телефон в подвале          | '+1 234 567 8900'     |
| `PAPER_SUPPORT_EMAIL`     | Контактный email в подвале            | 'office@example.com'  |
| `PAPER_SUPPORT_COMPANY`   | Название компании в подвале           | 'Web Studio Inc.'     |
| `PAPER_SUPPORT_WEBSITE`   | Ссылка на сайт компании в подвале     | 'https://webstudio.com/' |
| `PAPER_MENU`              | Меню в сайдбаре                       | |

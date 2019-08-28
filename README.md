# paper_admin

!(http://dl3.joxi.net/drive/2019/08/28/0025/1750/1701590/90/00584b8abc.png)
!(http://dl3.joxi.net/drive/2019/08/28/0025/1750/1701590/90/72f0b476ae.png)

## Installation
Add `paper_admin` **before** `django.contrib.admin`.
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
    Предоставляет `paper_admin.patches.mptt.admin.SortableMPTTModelAdmin`
    для оформления сортируемого дерева.

**Note**: как правило, патчи должны быть указаны в `INSTALLED_APPS`
**раньше**, чем библиотеки, которые они исправляют.

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

Доступные параметры для формирования пунтка меню через словарь:
* `label`: str      - заголовок пункта меню
* `url`: str        - ссылка или именованый URL
* `icon`: str       - классы иконки
* `classes`: str    - классы пункта меню
* `perms`: str/list - права, необходимые для отображения пункта (либо строка "superuser")
* `app`: str        - имя приложения. Добавляется к именам моделей в models
* `models`: list    - дочерние пукнты меню. Может содержать имена моделей.


## Settings

| `PAPER_SITE_TITLE`        | Базовая часть тэга <title>      |
| `PAPER_SITE_HEADER`       | Заголовок в сайдбаре            |
| `PAPER_ENVIRONMENT_NAME`  | Текст на плашке текущего окружения |
| `PAPER_ENVIRONMENT_COLOR` | Цвет фона плашки текущего окружения |
| `PAPER_SUPPORT_PHONE`     | Контактный телефон в подвале  |
| `PAPER_SUPPORT_EMAIL`     | Контактный email в подвале    |
| `PAPER_SUPPORT_COMPANY`   | Название компании в подвале   |
| `PAPER_SUPPORT_WEBSITE`   | Ссылка на сайт компании в подвале      |
| `PAPER_MENU`              | Меню в сайдбаре |

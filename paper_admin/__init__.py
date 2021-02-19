"""
    ===================================
      Bootstrap-интерфейс для админки
    ===================================

    Установка
    ---------
    Добавить "paper_admin" и патчи для сторонних библиотек в INSTALLED_APPS (вместо django.contrib.admin):
        INSTALLED_APPS = [
            "paper_admin",
            "paper_admin.patches.django_solo",
            "paper_admin.patches.mptt",
            ...
        ]

    Настройки
    ---------
    PAPER_ENVIRONMENT_NAME
    PAPER_ENVIRONMENT_COLOR
        type            str
        default         ''
        description     Параметры индикатора окружения в админке. Индикатор помогает не перепутать
                        сервер разработки от продакшена.

    PAPER_SUPPORT_PHONE
    PAPER_SUPPORT_EMAIL
    PAPER_SUPPORT_COMPANY
    PAPER_SUPPORT_WEBSITE
        type            str
        default         None
        description     Данные о компании, отображающиеся в подвале

    PAPER_MENU_DIVIDER
        type            str
        default         '-'
        description     Строка, которой обозначается разделитель в PAPER_MENU

    PAPER_MENU_HIDE_SINGLE_CHILD
        type            bool
        default         True
        description     Если корневой пункт меню содержит единственный дочерний элемент,
                        то корневому пункту будет поставлена ссылка дочернего элемента.
                        Дочерний элемент, при этом, не отображается.

    PAPER_MENU_PERM_SUPERUSER
        type            str
        default         'superuser'
        description     Строка, которой обозначается суперпользователь в списке необходимых
                        прав на отображение пункта меню

    PAPER_MENU
        type            list
        default         None
        description     Список пунктов меню боковой навигации.
                        Каждый пункт может быть представлен одним из четырех видов:
                            1) имя приложения (app_label)
                            2) путь к модели (app_label.model_name)
                            3) словарь
                            4) строка-разделитель (см. PAPER_MENU_DIVIDER)

                        Доступные параметры в словаря:
                            label: str      - заголовок пункта меню
                            url: str        - ссылка или именованый URL
                            icon: str       - классы иконки
                            classes: str    - классы пункта меню
                            perms: str/list - права, необходимые для отображения пункта
                            app: str        - имя приложения. Добавляется к именам моделей в models
                            models: list    - дочерние пукнты меню. Может содержать имена моделей.

                        В perms, помимо обычных прав вида "<app_label>.<permission_code>",
                        можно указать "superuser".

    PAPER_DEFAULT_TAB_NAME
        type            str
        default         ''
        description     Алиас вкладки, активной по-умолчанию. Если среди вкладок нет
                        вкладки с таким именем, будет активирована первая.

    PAPER_DEFAULT_TAB_TITLE
        type            str
        default         'General'
        description     Заголовок вкладки по-умолчанию.

    Пример добавления сортировки
    ----------------------------
    # models.py
        class MyModel(models.Model):
            ...
            order = models.IntegerField(_("order"), default=0, editable=False)

    # admin.py
        from paper_admin.admin import SortableAdminMixin

        class MyModelAdmin(SortableAdminMixin, admin.ModelAdmin):
            ...
            sortable = "order"

"""
__version__ = "1.1.3"
default_app_config = "paper_admin.apps.Config"

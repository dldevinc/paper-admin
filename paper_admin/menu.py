import itertools
import logging
from urllib import parse

from django.contrib.admin import site
from django.shortcuts import resolve_url
from django.utils.text import capfirst

from . import conf

MENU = None
item_counter = itertools.count()
logger = logging.getLogger("paper_admin.menu")


class MenuItemBase:
    __slots__ = [
        "_uid",
        "_parent",
        "_childs",
    ]

    def __init__(self):
        self._uid = next(item_counter)
        self._parent = None
        self._childs = []

    @property
    def uid(self):
        return self._uid

    @property
    def parent(self):
        return self._parent

    @property
    def childs(self):
        return tuple(self._childs)

    def append(self, *args):
        for item in filter(bool, args):
            if not isinstance(item, MenuItemBase):
                continue

            self._childs.append(item)
            item._parent = self


class MenuDivider(MenuItemBase):
    @property
    def divider(self):
        return True


class MenuItem(MenuItemBase):
    __slots__ = [
        "_app",
        "_label",
        "_url",
        "_icon",
        "_active",
        "_classes",
    ]

    def __init__(self, *, app="", label="", url="", icon="", classes=""):
        super().__init__()
        self._app = app
        self._label = label
        self._url = url
        self._classes = classes
        self._icon = icon
        self._active = False

    def __repr__(self):
        return "%s(%s, %s)" % (self.__class__.__name__, self.label, self.url)

    @property
    def child_items(self):
        return tuple(
            item for item in self._childs
            if isinstance(item, MenuItem)
        )

    @property
    def label(self):
        return capfirst(self._label)

    @label.setter
    def label(self, value):
        if value:
            self._label = value

    @property
    def url(self):
        if not self._url:
            return ""
        elif self._url.startswith(("#", "?")):
            return self._url
        else:
            return resolve_url(self._url)

    @url.setter
    def url(self, value):
        if value:
            self._url = str(value)

    @property
    def icon(self):
        return self._icon

    @icon.setter
    def icon(self, value):
        if value:
            self._icon = str(value)

    @property
    def classes(self):
        return self._classes

    @classes.setter
    def classes(self, value):
        if value:
            self._classes = str(value)

    @property
    def is_active(self):
        return self._active

    def clean_childs(self):
        self._childs = []

    def activate(self):
        current = self
        while current:
            current._active = True
            current = current.parent

    @classmethod
    def from_site_model(cls, site_model):
        """
        Создание MenuItem из модели admin.site
        """
        return cls(
            label=site_model["name"],
            url=site_model.get("admin_url") or site_model.get("add_url"),
        )

    @classmethod
    def from_site_app_model(cls, app_dict, app_label, model_name):
        """
        Создание MenuItem из модели admin.site по имени приложения и модели
        """
        app = app_dict.get(app_label.lower())
        if app is None:
            return

        try:
            return next(
                cls.from_site_model(site_model)
                for site_model in app["models"]
                if site_model["object_name"].lower() == model_name.lower()
            )
        except StopIteration:
            pass

    @classmethod
    def from_site_app(cls, app_dict, app_label):
        """
        Создание MenuItem из admin.site по имени приложения
        """
        app = app_dict.get(app_label.lower())
        if app is None:
            return

        item = MenuItem(
            label=app["name"],
            url=app["app_url"],
        )
        for model in app["models"]:
            item.append(MenuItem.from_site_model(model))
        return item


def _has_perms(user, perms):
    """
    Проверка наличия прав на пункт меню.

    :type perms: str | list[str] | function
    :rtype: bool
    """
    if not perms:
        return True

    if callable(perms):
        return perms()

    if isinstance(perms, str):
        perms = (perms,)

    for perm in perms:
        if perm == conf.MENU_PERM_SUPERUSER:
            if not user.is_superuser:
                return False
        elif perm == conf.MENU_PERM_STAFF:
            if not user.is_staff:
                return False
        else:
            if not user.has_perm(perm):
                return False

    return True


def _create_menu_item(request, app_dict, conf_item, parent_app=""):
    """
    Создание пункта меню из параметра конфигурации.

    :type request: django.core.handlers.wsgi.WSGIRequest
    :type app_dict: dict[str, dict]
    :type conf_item: str | dict[str, Any]
    :type parent_app: str
    :rtype: MenuItemBase
    """
    if conf_item == conf.MENU_DIVIDER:
        return MenuDivider()

    if isinstance(conf_item, str):
        conf_item = conf_item.lower()
        if "." in conf_item:
            # absolute path to model
            app_label, model_name = conf_item.rsplit(".", 1)
            item = MenuItem.from_site_app_model(app_dict, app_label, model_name)
        elif parent_app:
            # model
            item = MenuItem.from_site_app_model(app_dict, parent_app, conf_item)
        else:
            # app
            item = MenuItem.from_site_app(app_dict, conf_item)
    elif isinstance(conf_item, dict):
        item = MenuItem()

        # проверка прав
        perms = conf_item.get("perms")
        if not _has_perms(request.user, perms):
            return

        app_name = conf_item.get("app")
        site_app = app_dict.get(app_name) if app_name else None
        if site_app:
            item.label = site_app["name"]

        item.label = conf_item.get("label")
        item.url = conf_item.get("url")
        item.icon = conf_item.get("icon")
        item.classes = conf_item.get("classes")

        models = conf_item.get("models")
        if models:
            for conf_subitem in models:
                subitem = _create_menu_item(
                    request, app_dict, conf_subitem, parent_app=app_name or parent_app
                )
                item.append(subitem)
        elif site_app:
            for site_model in site_app["models"]:
                subitem = MenuItem.from_site_model(site_model)
                item.append(subitem)
    else:
        raise TypeError("unsupported type:\n{}".format(conf_item))

    if not item or not item.label:
        return

    if conf.MENU_HIDE_SINGLE_CHILD:
        if len(item.childs) == 1 and not item.childs[0].childs:
            item.url = item.childs[0].url
            item.clean_childs()

    # Возвращаем только пункты с URL или дочерними пунктами
    if item.url or (isinstance(item, MenuItem) and item.child_items):
        return item


def get_menu(request):
    """
    Построение дерева меню.

    :type request: django.core.handlers.wsgi.WSGIRequest
    :rtype: list[MenuItemBase]
    """
    app_list = site.get_app_list(request)
    app_dict = {
        app["app_label"]: app
        for app in app_list
    }

    if conf.MENU:
        items = (
            _create_menu_item(request, app_dict, item)
            for item in conf.MENU
        )
    else:
        items = (
            MenuItem.from_site_app(app_dict, app["app_label"])
            for app in app_list
        )

    return list(filter(bool, items))


def _compare_urls(url1, url2):
    """
    Сравнение похожести двух урлов

    :type url1: str
    :type url2: str
    :rtype: float
    """
    parsed1 = parse.urlparse(url1)
    path1 = parsed1.path.strip("/").split("/")
    parsed2 = parse.urlparse(url2)
    path2 = parsed2.path.strip("/").split("/")

    max_part_count = max(len(path1), len(path2))
    same_count = sum(
        1 for _ in itertools.takewhile(
            lambda x: x[0] == x[1],
            zip(path1, path2)
        )
    )
    return same_count / max_part_count


def _compare_menu_urls(request, menu):
    """
    Сравнение текущего урла с урлом каждого пункта меню.

    :type request: django.core.handlers.wsgi.WSGIRequest
    :type menu: list[MenuItemBase] | tuple(MenuItemBase)
    :rtype: list[(float, MenuItemBase)]
    """
    result = []
    for item in menu:
        if not isinstance(item, MenuItem):
            continue

        if item.childs:
            subitems = _compare_menu_urls(request, item.childs)
            result.extend(subitems)

        equality = _compare_urls(request.path, item.url)
        result.append((equality, item))
    return result


def activate_menu(request, menu):
    """
    Поиск и активация самого подходящего пункта меню.

    :type request: django.core.handlers.wsgi.WSGIRequest
    :type menu: list of MenuItemBase
    """
    equality_list = _compare_menu_urls(request, menu)
    max_equality = max(pair[0] for pair in equality_list)
    best_items = tuple(
        item
        for equality, item in equality_list
        if equality == max_equality and isinstance(item, MenuItem)
    )

    if len(best_items) == 1:
        # найдено лучшее совпадение
        best_items[0].activate()
    elif len(best_items) > 1:
        # найдено несколько совпадений
        if max_equality == 1:
            for item in best_items:
                item.activate()
        else:
            parent = best_items[0].parent
            if parent is not None:
                parent.activate()
    else:
        # совпадений не найдено
        logger.warning("Not found suitable menu items")

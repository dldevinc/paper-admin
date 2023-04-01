import copy
import itertools
import operator
from typing import (
    Any,
    Callable,
    Dict,
    Generator,
    Iterable,
    List,
    Literal,
    Optional,
    Union,
)
from urllib import parse

import anytree
from anytree import NodeMixin, PreOrderIter
from django.contrib.admin import site
from django.core.exceptions import ImproperlyConfigured
from django.core.handlers.wsgi import WSGIRequest
from django.shortcuts import resolve_url
from django.template import loader

__all__ = ["Menu", "Item", "Divider"]

PermissionType = Union[str, Callable[[WSGIRequest], bool]]


class ExcludeItemError(Exception):
    pass


class ItemBase(NodeMixin):
    counter = itertools.count()

    def resolve(self) -> Optional[Literal[False]]:
        """
        Форматирование пункта меню.
        Если метод вернёт False, то этот элемент и все его дочерние элементы
        будут удалены из дерева.
        """
        pass

    def is_allowed(self, request: WSGIRequest) -> bool:
        """
        Проверка прав на отображение пункта меню.
        Если метод вернёт False, то этот элемент и все его дочерние элементы
        будут удалены из дерева.
        """
        return True

    def render(self, request: WSGIRequest = None) -> str:
        raise NotImplementedError


class Divider(ItemBase):
    def __repr__(self):
        classname = self.__class__.__name__
        return f"{classname}()"

    def render(self, request: WSGIRequest = None) -> str:
        return loader.render_to_string("paper_admin/menu/divider.html", {
            "item": self
        }, request=request)


class Item(ItemBase):
    def __init__(
        self,
        *,
        app: str = None,
        model: str = None,
        label: str = None,
        url: str = None,
        icon: str = None,
        perms: Union[PermissionType, List[PermissionType]] = None,
        classes: str = None,
        target: Literal["_blank", "_self"] = "_self",
        children: Iterable[Union[str, ItemBase]] = (),
    ):
        """
        Единственным обязательным параметром является `label`, но он может быть указан
        неявно - через `app` или `model`.
        """
        if app and model:
            raise ImproperlyConfigured(
                "You can only specify one of `app` or `model`, not both"
            )

        if not app and not model and label is None:
            raise ImproperlyConfigured(
                "You must specify either `app`, `model` or `label`"
            )

        self._uid = next(self.counter)
        self.app = app
        self.model = model
        self.label = label
        self.url = url
        self.icon = icon
        self.perms = perms
        self.classes = classes
        self.target = target
        self._children = children
        self._resolved = False
        self._active = False

    def __repr__(self):
        classname = self.__class__.__name__
        name = self.label or self.model or self.app
        return f"{classname}({name})"

    @property
    def uid(self) -> int:
        return self._uid

    @property
    def is_active(self):
        return self._active

    def resolve(self):
        if self._resolved:
            return

        self._resolve_app()
        self._resolve_model()
        self._resolve_children()
        self._resolve_url()

        self._resolved = True
    resolve.alters_data = True

    def _resolve_app(self):
        if not self.app:
            return

        app_config = self.root.get_app_config(self.app)
        if app_config is None:
            raise ExcludeItemError

        self.label = self.label or app_config["name"]
        self.url = self.url or app_config.get("app_url")

    def _resolve_model(self):
        if not self.model:
            return

        if "." in self.model:
            app_label, model_name = self.model.rsplit(".", 1)
        else:
            try:
                app_label = next(
                    node.app
                    for node in self.parent.iter_path_reverse()
                    if isinstance(node, Item) and node.app
                )
            except StopIteration:
                raise ExcludeItemError
            else:
                model_name = self.model

        model_config = self.root.get_model_config(app_label, model_name)
        if model_config is None:
            raise ExcludeItemError

        self.label = self.label or model_config["name"]
        self.url = self.url or model_config.get("admin_url") or model_config.get("add_url")

    def _resolve_children(self):
        if self._children:
            for child in self._children:
                if isinstance(child, str):
                    subitem = Item(model=child)
                elif isinstance(child, ItemBase):
                    subitem = copy.copy(child)
                else:
                    raise TypeError("unsupported item type: %s" % type(child))

                subitem.parent = self
        elif self.app:
            for subitem in self.root.get_default_app_models(self.app):
                subitem.parent = self

    def _resolve_url(self):
        if self.url and not self.url.startswith(("http", "#", "?")):
            self.url = resolve_url(self.url)

    def is_allowed(self, request: WSGIRequest) -> bool:
        from . import conf

        if not self.perms:
            return True

        if isinstance(self.perms, str) or callable(self.perms):
            permissions = (self.perms,)
        else:
            permissions = tuple(self.perms)

        for permission in permissions:
            if permission == conf.MENU_SUPERUSER_PERMISSION:
                if not request.user.is_superuser:
                    return False
            elif permission == conf.MENU_STAFF_PERMISSION:
                if not request.user.is_staff:
                    return False
            elif isinstance(permission, str):
                if not request.user.has_perm(permission):
                    return False
            else:
                if not permission(request):
                    return False

        return True

    def render(self, request: WSGIRequest = None) -> str:
        if self.children:
            return loader.render_to_string("paper_admin/menu/submenu.html", {
                "item": self
            }, request=request)
        else:
            return loader.render_to_string("paper_admin/menu/item.html", {
                "item": self
            }, request=request)

    def activate(self):
        """
        Активация пункта меню и всех его родительских пунктов.
        """
        for item in self.iter_path_reverse():
            if isinstance(item, Item):
                item._active = True
    activate.alters_data = True


class Menu(ItemBase):
    def __init__(self, request: WSGIRequest):
        self.request = request
        self.app_list = site.get_app_list(request)

    def get_app_config(self, app_label: str) -> Optional[Dict[str, Any]]:
        """
        Получение конфигурации приложения по его имени.
        """
        for app_conf in self.app_list:
            if app_conf["app_label"] == app_label.lower():
                return app_conf

    def get_model_config(self, app_label: str, model_name: str) -> Optional[Dict[str, Any]]:
        """
        Получение конфигурации модели по имени приложения и модели.
        """
        app_conf = self.get_app_config(app_label)
        if app_conf is None:
            return

        for model_conf in app_conf.get("models", []):
            if model_conf["object_name"].lower() == model_name.lower():
                return model_conf

    def get_default_app_models(self, app_label: str) -> Generator[Item, Any, None]:
        app_config = self.get_app_config(app_label)
        for model in app_config["models"]:
            yield Item(
                model=model["object_name"]
            )

    def build_tree(self):
        """
        Построение дерева меню.
        """
        from . import conf

        if conf.MENU:
            for item_conf in conf.MENU:
                item = self.construct_item(item_conf)
                if item is None:
                    continue

                item.parent = self
        else:
            # Структура по умолчанию
            for app in self.app_list:
                app_item = Item(
                    app=app["app_label"]
                )
                app_item.parent = self

                for model in app["models"]:
                    model_item = Item(
                        model=model["object_name"]
                    )
                    model_item.parent = app_item

    def construct_item(
        self,
        value: Union[str, Dict, ItemBase],
        parent_app: str = None
    ) -> Optional[ItemBase]:
        """
        Создание узла дерева по его представлению в PAPER_MENU.
        """
        from . import conf

        if isinstance(value, ItemBase):
            return copy.copy(value)
        elif isinstance(value, str):
            if value == conf.MENU_DIVIDER:
                return Divider()

            value = value.lower()
            if "." in value:
                # path to model
                return Item(
                    model=value,
                )
            elif parent_app:
                # model
                return Item(
                    model=f"{parent_app}.{value}",
                )
            else:
                # app
                return Item(
                    app=value,
                )
        elif isinstance(value, dict):
            item = Item(
                app=value.get("app"),
                label=value.get("label"),
                url=value.get("url"),
                icon=value.get("icon"),
                classes=value.get("classes"),
            )

            models = value.get("models")
            if models:
                for submodel in models:
                    subitem = self.construct_item(submodel, item.app or parent_app)
                    subitem.parent = item
            elif item.app:
                for subitem in self.get_default_app_models(item.app):
                    subitem.parent = item

            return item
        else:
            raise TypeError("unsupported item type: %s" % type(value))

    def resolve_tree(self, request: WSGIRequest):
        """
        Форматирование элементов дерева, проверка прав на пункты меню,
        удаление листьев дерева, не имеющих ссылки.
        """
        from . import conf

        # форматирование и проверка прав
        resolve_tree(request, self)

        for item in anytree.PostOrderIter(self):
            if item.is_leaf:
                # удаление листьев дерева, не имеющих ссылки
                if isinstance(item, Item) and not item.url:
                    item.parent = None
            elif item.height == 1:
                # удаление пунктов меню, имеющих в качестве потомков
                # только разделители
                has_items = any(
                    isinstance(child, Item)
                    for child in item.children
                )
                if not has_items:
                    item.parent = None

                # сворачивание пуктов меню, содержащих единственный подпункт
                if conf.MENU_COLLAPSE_SINGLE_CHILDS:
                    if len(item.children) == 1:
                        item.url = item.children[0].url
                        item.children = []

    def activate_tree(self, request: WSGIRequest):
        """
        Активация пуктов меню на основании текущего URL.
        """
        max_equality = 0
        best_items = []
        for item in PreOrderIter(self):
            if not isinstance(item, Item) or not item.url:
                continue

            equality = calculate_url_equality(request.path, item.url)
            if equality > max_equality:
                max_equality = equality
                best_items = [item]
            elif equality == max_equality:
                best_items.append(item)

        if not best_items:
            return

        if max_equality == 1:
            # найдено идеальное совпадение
            for item in best_items:
                item.activate()
        else:
            # выделение наиболее близкого пункта меню
            if len(best_items) == 1:
                best_items[0].activate()
            else:
                parent = best_items[0].parent
                if parent is not None and isinstance(parent, Item):
                    parent.activate()

    def render(self, request: WSGIRequest = None) -> str:
        return "".join(
            item.render(request)
            for item in self.children
        )


def calculate_url_equality(url1: str, url2: str) -> float:
    """
    Вычисление похожести путей двух URL.
    Возвращает количество совпадающих частей URL, делённое на максимальное
    количество таких частей.

    Примеры:
        calculate_url_equality(
            "/blog/article/delete/",
            "/blog/article/add/safe/"
        ) = 2/4 = 0.5

        calculate_url_equality(
            "/",
            "/blog/article/add/"
        ) = 0
    """
    parsed1 = parse.urlparse(url1)
    parsed2 = parse.urlparse(url2)
    path1 = parsed1.path.strip("/").split("/")
    path2 = parsed2.path.strip("/").split("/")

    same_count = sum(
        itertools.takewhile(
            int,
            itertools.starmap(
                operator.eq,
                zip(path1, path2)
            )
        )
    )
    return same_count / max(len(path1), len(path2))


def resolve_tree(request: WSGIRequest, root: ItemBase = None):
    """
    Форматирование элементов дерева.
    Проверка прав на пункты меню.
    """
    for item in root.children:
        try:
            item.resolve()
        except ExcludeItemError:
            item.parent = None
            continue

        if item.is_allowed(request) is False:
            item.parent = None
            continue

        resolve_tree(request, item)

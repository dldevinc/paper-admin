import sys
import inspect

# Pattern for the ids of the original attributes stored.
ORIGINAL_ID = "_monkey_{}__{}"


def get_original(cls=None, attr=None):
    """
    Возвращает оригинальную реализацию атрибута.
    Подобно вызову "super()", можно не указывать ни класс, ни имя атрибута.

        class PatchClass(Class, metaclass=MonkeyPatchMeta):
            def __init__(self, *args, **kwargs):
                get_original()(*args, **kwargs)
    """
    current_frame = inspect.currentframe()
    caller_frame = inspect.getouterframes(current_frame, 2)
    caller_info = caller_frame[1]

    if isinstance(cls, str):
        attr = cls
        cls = None

    if attr is None:
        attr = caller_info.function

    if cls is None:
        cls = type(caller_info.frame.f_locals["self"])

    original_id = ORIGINAL_ID.format(cls.__name__, attr)
    original_methods = getattr(cls, original_id)

    caller_filename = caller_info.frame.f_code.co_filename
    caller_lineno = caller_info.frame.f_code.co_firstlineno
    for index, method in enumerate(original_methods):
        method_filename = method.__code__.co_filename
        method_lineno = method.__code__.co_firstlineno
        if method_filename == caller_filename and method_lineno == caller_lineno:
            return original_methods[index + 1]
    else:
        return original_methods[0]


class MonkeyPatchMeta(type):
    """
    Метакласс, который вместо создания дочернего класса патчит родительский класс.
    Оригинальный метод/атрибут можно получить через вызов get_original.

        class PatchClass(Class, metaclass=MonkeyPatchMeta):
            def __init__(self, *args, **kwargs):
                get_original()(*args, **kwargs)

    """
    def __new__(mcs, name, bases, attrs):
        if len(bases) != 1:
            raise TypeError("Monkey patch can only inherit from one base class")

        target = bases[0]

        # fix python 3.8+
        if "__classcell__" in attrs:
            if sys.version_info >= (3, 8):
                attrs["__classcell__"].cell_contents = target

        for attr_name, attr_value in attrs.items():
            if attr_name in {"__module__", "__qualname__", "__classcell__"}:
                continue

            if hasattr(target, attr_name):
                original_id = ORIGINAL_ID.format(target.__name__, attr_name)
                if not hasattr(target, original_id):
                    setattr(target, original_id, [])

                original_methods = getattr(target, original_id)
                original_methods.insert(0, getattr(target, attr_name))

            setattr(target, attr_name, attr_value)

            # for descriptors like "cached_property"
            if hasattr(attr_value, "__set_name__"):
                attr_value.__set_name__(target, attr_name)

        return target

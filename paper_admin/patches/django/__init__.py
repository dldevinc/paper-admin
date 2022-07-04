# Патч `renderer` должен вызываться после патча `widgets`, т.к. он ссылается
# на файл admin.py приложения auth. Вызовы `admin.register()` должны выполняться
# с уже пропатченным `formfield_overrides`.
from . import (
    changelist,
    filters,
    helpers,
    options,
    prepopulate,
    renderer,
    sites,
    sortable,
    styles,
    tabs,
    widgets,
)

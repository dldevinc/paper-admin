# Патч `renderer` должен вызываться после патча `widgets`, т.к. он ссылается
# на файл admin.py приложения auth. Вызовы `admin.register()` должны выполняться
# с уже пропатченным `formfield_overrides`.
from . import (  # isort: skip
    changelist,
    filters,
    forms,
    helpers,
    options,
    prepopulate,
    sites,
    sortable,
    styles,
    tabs,
    widgets,
    renderer,
)

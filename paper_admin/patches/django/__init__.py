from . import changelist
from . import filters
from . import sortable
from . import tabs
from . import widgets

# Патч `renderer` должен вызываться после патча `widgets`, т.к. он ссылается
# на файл admin.py приложения auth. Вызовы `admin.register()` должны выполняться
# с уже пропатченным `formfield_overrides`.
from . import renderer

"""
Добавляет функционал сортировки методом Drag-n-Drop к ModelAdmin и его дочерним классам.
Реализация опирается на переопределенный класс `ResultList`.

Для того, чтобы сделать модель сортируемой, необходимо добавить в модель числовое поле,
а затем указать название добавленного поля в параметре `sortable` в ModelAdmin:

    # models.py

    class MyModel(models.Model):
        # ...
        order = models.IntegerField("order", default=0)


    # admin.py

    @admin.register(MyModel)
    class MyModelAdmin(admin.ModelAdmin):
        # ...
        sortable = "order"

"""
from . import changelist
from . import helpers
from . import options

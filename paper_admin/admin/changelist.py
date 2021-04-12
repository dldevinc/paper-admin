from django.utils.functional import cached_property


class PaperChangeListMixin:
    def __init__(self, request, *args, **kwargs):
        super().__init__(request, *args, **kwargs)
        self.request = request

    @property
    def pagination_required(self):
        return (not self.show_all or not self.can_show_all) and self.multi_page


class SortableChangeListMixin:
    sortable = None

    @cached_property
    def can_sort(self):
        """
        Возвращает True, если таблица в первую очередь отсортирована
        по полю, объявленному в sortable.

        :rtype: bool
        """
        ordering_field_columns = self.get_ordering_field_columns()  # noqa: F821
        if not ordering_field_columns:
            return

        idx = list(self.list_display).index("_sortable_field")  # noqa: F821
        return list(ordering_field_columns)[0] == idx

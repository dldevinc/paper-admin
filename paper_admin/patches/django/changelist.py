from django.contrib.admin.views.main import ALL_VAR, ChangeList

from paper_admin.monkey_patch import MonkeyPatchMeta, get_original


class PatchChangeList(ChangeList, metaclass=MonkeyPatchMeta):
    def __init__(self, request, *args, **kwargs):
        self.request = request
        self.has_toolbar_filters = False
        get_original(ChangeList)(self, request, *args, **kwargs)

    def get_queryset(self, request, *args, **kwargs):
        qs = get_original(ChangeList)(self, request, *args, **kwargs)

        for filter_spec in self.filter_specs:
            placement = getattr(filter_spec, "placement", None)
            if placement != "top":
                self.has_toolbar_filters = True
                break

        return qs

    @property
    def has_actions(self):
        return bool(self.model_admin.get_actions(self.request))

    @property
    def pagination_required(self):
        return (not self.show_all or not self.can_show_all) and self.multi_page

    @property
    def show_all_url(self):
        need_show_all_link = self.can_show_all and not self.show_all and self.multi_page
        return need_show_all_link and self.get_query_string({ALL_VAR: ""})

from tree_queries.forms import TreeNodeIndentedLabels

from paper_admin.monkey_patch import MonkeyPatchMeta


class PatchTreeNodeIndentedLabels(TreeNodeIndentedLabels, metaclass=MonkeyPatchMeta):
    def label_from_instance(self, obj):
        depth = getattr(obj, "tree_depth", 0)
        return "{} {}".format("┄" * depth, obj)

from django.db import models
from django.utils.translation import gettext_lazy as _
from mptt.models import MPTTModel, TreeForeignKey
from solo.models import SingletonModel
from tree_queries.models import TreeNode


class Company(models.Model):
    title = models.CharField(_("title"), max_length=255)
    order = models.IntegerField(_("order"), default=0, editable=False)

    class Meta:
        verbose_name_plural = _("Companies")

    def __str__(self):
        return self.title


class Person(models.Model):
    first_name = models.CharField(_("first name"), max_length=255)
    last_name = models.CharField(_("last name"), max_length=255)

    @property
    def full_name(self):
        return (self.first_name + " " + self.last_name).strip()

    def __str__(self):
        return self.full_name


class Staff(models.Model):
    company = models.ForeignKey(Company, related_name="staff", on_delete=models.CASCADE)
    person = models.ForeignKey(Person, related_name="companies", on_delete=models.CASCADE)
    position = models.CharField(_("position"), max_length=255)
    order = models.IntegerField(_("order"), default=0, editable=False)

    def __str__(self):
        return str(self.person)


class Industry(models.Model):
    title = models.CharField(_("title"), max_length=255)

    def __str__(self):
        return str(self.title)


class CompanyIndustry(models.Model):
    company = models.ForeignKey(Company, related_name="industry", on_delete=models.CASCADE)
    industry = models.ForeignKey(Industry, related_name="companies", on_delete=models.CASCADE)
    order = models.IntegerField(_("order"), default=0, editable=False)

    def __str__(self):
        return str(self.industry)


class MPTTTree(MPTTModel):
    parent = TreeForeignKey("self", null=True, blank=True, related_name="children", on_delete=models.CASCADE)
    title = models.CharField(_("title"), max_length=255)
    position = models.PositiveIntegerField(_("position"), default=0, editable=False)

    class Meta:
        ordering = ["position"]
        verbose_name = _("MPTT")
        verbose_name_plural = _("MPTT")

    class MPTTMeta:
        order_insertion_by = ["position"]

    def __str__(self):
        return self.title


class DjangoTreeQueriesNode(TreeNode):
    title = models.CharField(_("title"), max_length=255)
    position = models.PositiveIntegerField(_("position"), default=0, editable=False)

    class Meta:
        ordering = ("position",)
        verbose_name = _("Django Tree Queries")
        verbose_name_plural = _("Django Tree Queries")

    def __str__(self):
        return self.title

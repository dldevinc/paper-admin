import os

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from mptt.models import MPTTModel, TreeForeignKey
from solo.models import SingletonModel

HELP_TEXT = "Lorem ipsum <b>dolor</b> sit amet, consetetur sadipscing elitr, " \
            "sed diam nonumy eirmod tempor invidunt ut labore et dolore magna " \
            "aliquyam erat, sed diam voluptua"


class Tag(models.Model):
    name = models.CharField(_("name"), max_length=128)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Category(models.Model):
    CHOICES = (
        (1, _("One")),
        (2, _("Two")),
        (3, _("Three")),
        (4, _("Four")),
    )

    f_fk = models.ForeignKey(Tag, verbose_name=_("FK"), related_name="+",
        null=True, on_delete=models.SET_NULL, help_text=HELP_TEXT
    )
    f_o2o = models.OneToOneField(Tag, verbose_name=_("One-to-One"), related_name="+",
        null=True, blank=True, on_delete=models.SET_NULL, help_text=HELP_TEXT
    )
    f_fk1 = models.ForeignKey(Tag, verbose_name=_("FK Autocomplete"),
        null=True, on_delete=models.SET_NULL, blank=True, related_name="+", help_text=HELP_TEXT
    )
    f_fk2 = models.ForeignKey(Tag, verbose_name=_("FK Radio"),
        null=True, on_delete=models.SET_NULL, blank=True, related_name="+", help_text=HELP_TEXT
    )
    f_fk3 = models.ForeignKey(Tag, verbose_name=_("FK Raw ID"), null=True, on_delete=models.SET_NULL, blank=True, related_name="+", help_text=HELP_TEXT)
    f_tags = models.ManyToManyField(Tag, verbose_name=_("M2M"), help_text=HELP_TEXT)
    f_tags1 = models.ManyToManyField(Tag, verbose_name=_("M2M Checkboxes"), blank=True, related_name="+", help_text=HELP_TEXT)
    f_tags2 = models.ManyToManyField(Tag, verbose_name=_("M2M Raw ID"), related_name="+", help_text=HELP_TEXT)
    f_tags3 = models.ManyToManyField(Tag, verbose_name=_("M2M Horizontal"), related_name="+", help_text=HELP_TEXT)
    f_tags4 = models.ManyToManyField(Tag, verbose_name=_("M2M Vertical"), related_name="+", help_text=HELP_TEXT)
    f_tags5 = models.ManyToManyField(Tag, verbose_name=_("M2M Autocomplete"), related_name="+", help_text=HELP_TEXT)

    f_bool = models.BooleanField(_("bool"), default=False, help_text=HELP_TEXT)
    f_bool2 = models.BooleanField(_("bool 2"), default=False, help_text=HELP_TEXT)
    f_nullbool = models.NullBooleanField(_("nullbool"), help_text=HELP_TEXT)
    f_small_int = models.PositiveSmallIntegerField(_("small int"), default=0, help_text=HELP_TEXT)
    f_int_choices = models.PositiveSmallIntegerField(_("int choices"), choices=CHOICES, default=1, help_text=HELP_TEXT)
    f_int_choices2 = models.PositiveSmallIntegerField(_("radio choices"), choices=CHOICES, default=1, help_text=HELP_TEXT)
    f_int = models.IntegerField(_("int"), default=0, help_text=HELP_TEXT)
    f_bigint = models.BigIntegerField(_("bigint"), default=0, help_text=HELP_TEXT)
    f_float = models.FloatField(_("float"), default=0, help_text=HELP_TEXT)
    f_decimal = models.DecimalField(_("decimal"), blank=True, decimal_places=2, max_digits=16, default=0, help_text=HELP_TEXT)

    f_duration = models.DurationField(_("duration"), blank=True, null=True, help_text=HELP_TEXT)
    f_date = models.DateField(_("date"), blank=True, null=True, help_text=HELP_TEXT)
    f_date2 = models.DateField(_("date selects"), blank=True, null=True, help_text=HELP_TEXT)
    f_time = models.TimeField(_("time"), blank=True, null=True, help_text=HELP_TEXT)
    f_datetime = models.DateTimeField(_("datetime"), blank=True, null=True, help_text=HELP_TEXT)

    f_hidden1 = models.CharField(_("hidden1"), blank=True, max_length=128, help_text=HELP_TEXT)
    f_hidden2 = models.CharField(_("hidden2"), blank=True, max_length=128, help_text=HELP_TEXT)
    f_hidden3 = models.CharField(_("hidden3"), blank=True, max_length=128, help_text=HELP_TEXT)

    f_char = models.CharField(_("char"), max_length=128, help_text=HELP_TEXT)
    f_slug = models.SlugField(_("slug"), blank=True, max_length=128, help_text=HELP_TEXT)
    f_email = models.EmailField(_("email"), blank=True, help_text=HELP_TEXT)
    f_pass = models.CharField(_("password"), max_length=128, blank=True, help_text=HELP_TEXT)
    f_ip = models.GenericIPAddressField(_("IP"), blank=True, null=True, help_text=HELP_TEXT)
    f_text = models.TextField(_("text"), blank=True, max_length=512, help_text=HELP_TEXT)
    f_url = models.URLField(_("URL"), blank=True, help_text=HELP_TEXT)
    f_uuid = models.UUIDField(_("UUID"), blank=True, null=True, help_text=HELP_TEXT)
    f_filepath = models.FilePathField(_("filepath"), blank=True, path=os.path.join(settings.BASE_DIR, "app"), help_text=HELP_TEXT)
    f_file = models.FileField(_("file"), blank=True, help_text=HELP_TEXT, upload_to="category")
    f_image = models.ImageField(_("image"), blank=True, help_text=HELP_TEXT, upload_to="category")

    f_char_ro = models.CharField(_("char RO"), blank=True, max_length=128, help_text=HELP_TEXT)
    f_int_ro = models.IntegerField(_("int RO"), default=0, help_text=HELP_TEXT)
    f_text_ro = models.TextField(_("text RO"), blank=True, help_text=HELP_TEXT)

    order = models.PositiveIntegerField(_("order"), default=0, editable=False)

    class Meta:
        ordering = ["order"]
        verbose_name = _("category")
        verbose_name_plural = _("categories")

    def __str__(self):
        return self.f_char


class Item(models.Model):
    category = models.ForeignKey(Category, verbose_name=_("category"), on_delete=models.CASCADE)
    hidden = models.IntegerField(_("hidden"), default=1)
    readonly = models.CharField(_("readonly"), max_length=128, blank=True, default="Do not edit me")
    name = models.CharField(_("name"), max_length=128, help_text=HELP_TEXT)
    slug = models.SlugField(_("slug"), help_text=HELP_TEXT)
    url = models.URLField(_("url"), blank=True, help_text=HELP_TEXT)
    text = models.TextField(_("text"), blank=True)
    order = models.IntegerField(_("order"), default=0)

    class Meta:
        ordering = ["order"]
        verbose_name = _("item")
        verbose_name_plural = _("items")

    def __str__(self):
        return self.name


class SubCategory(MPTTModel):
    category = models.ForeignKey(Category, verbose_name=_("category"), on_delete=models.CASCADE)
    parent = TreeForeignKey("self", null=True, blank=True, related_name="children", on_delete=models.CASCADE)
    name = models.CharField(_("name"), max_length=128, help_text=HELP_TEXT)
    number = models.IntegerField(_("number"), default=7)
    order = models.PositiveIntegerField(_("order"), default=0, editable=False)

    class Meta:
        ordering = ["order"]
        verbose_name = _("subcategory")
        verbose_name_plural = _("subcategories")

    class MPTTMeta:
        order_insertion_by = ["order"]

    def __str__(self):
        return self.name


class SigletonExample(SingletonModel):
    title = models.CharField(_("title"), max_length=255)

    class Meta:
        verbose_name = _("singleton")
        verbose_name_plural = _("singletons")

    def __str__(self):
        return self.title

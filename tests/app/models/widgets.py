import os

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from djmoney.models.fields import MoneyField

from .tag import Tag


class Widgets(models.Model):
    CHOICES = (
        (1, _("One")),
        (2, _("Two")),
        (3, _("Three")),
        (4, _("Four")),
    )

    # Boolean
    f_boolean = models.BooleanField(
        _("boolean"),
        default=False,
        help_text=_("Standard boolean field")
    )
    f_switch = models.BooleanField(
        _("switch"),
        default=False,
        help_text=_("Boolean field with <code>AdminSwitchInput</code> widget")
    )

    # Numeric
    f_small_int = models.SmallIntegerField(
        _("small integer"),
        default=0,
        help_text=_("Standard <code>SmallIntegerField</code>")
    )
    f_int = models.IntegerField(
        _("integer"),
        default=0,
        help_text=_("Standard <code>IntegerField</code>")
    )
    f_bigint = models.BigIntegerField(
        _("big integer"),
        default=0,
        help_text=_("Standard <code>BigIntegerField</code>")
    )
    f_float = models.FloatField(
        _("float"),
        default=0,
        help_text=_("Standard <code>FloatField</code>")
    )
    f_decimal = models.DecimalField(
        _("decimal"),
        decimal_places=2,
        max_digits=16,
        default=0,
        help_text=_("Standard <code>DecimalField</code>")
    )

    # Choices
    f_choices = models.SmallIntegerField(
        _("choices"),
        choices=CHOICES,
        default=1,
        help_text=_("Integer choices")
    )
    f_radio_choices = models.SmallIntegerField(
        _("Radio choices"),
        choices=CHOICES,
        default=1,
        help_text=_("Radio choices")
    )

    # Date & Time
    f_date = models.DateField(
        _("date"),
        null=True,
        blank=True,
        help_text=_("Standard <code>DateField</code>")
    )
    f_select_date = models.DateField(
        _("date selects"),
        null=True,
        blank=True,
        help_text=_("<code>DateField</code> with <code>SelectDateWidget</code>")
    )
    f_time = models.TimeField(
        _("time"),
        null=True,
        blank=True,
        help_text=_("Standard <code>TimeField</code>")
    )
    f_datetime = models.DateTimeField(
        _("datetime"),
        null=True,
        blank=True,
        help_text=_("Standard <code>DateTimeField</code>")
    )
    f_duration = models.DurationField(
        _("duration"),
        null=True,
        blank=True,
        help_text=_("Standard <code>DurationField</code>")
    )

    # Text
    f_char = models.CharField(
        _("char"),
        max_length=128,
        blank=True,
        help_text=_("Standard <code>CharField</code>")
    )
    f_slug = models.SlugField(
        _("slug"),
        blank=True,
        max_length=128,
        help_text=_("Standard <code>SlugField</code>")
    )
    f_email = models.EmailField(
        _("email"),
        blank=True,
        help_text=_("Standard <code>EmailField</code>")
    )
    f_password = models.CharField(
        _("password"),
        max_length=128,
        blank=True,
        help_text=_("<code>CharField</code> with <code>PasswordInput</code>")
    )
    f_ip = models.GenericIPAddressField(
        _("IP"),
        blank=True,
        null=True,
        help_text=_("Standard <code>GenericIPAddressField</code>")
    )
    f_text = models.TextField(
        _("text"),
        blank=True,
        help_text=_("Standard <code>TextField</code>")
    )
    f_url = models.URLField(
        _("URL"),
        blank=True,
        help_text=_("Standard <code>URLField</code>")
    )
    f_uuid = models.UUIDField(
        _("UUID"),
        blank=True,
        null=True,
        help_text=_("Standard <code>UUIDField</code>")
    )

    # Files
    f_filepath = models.FilePathField(
        _("filepath"),
        blank=True,
        path=os.path.join(settings.BASE_DIR, "app"),
        help_text=_("Standard <code>FilePathField</code>")
    )
    f_file = models.FileField(
        _("file"),
        blank=True,
        upload_to="widgets",
        help_text=_("Standard <code>FileField</code>")
    )
    f_file_input = models.FileField(
        _("file input"),
        blank=True,
        upload_to="widgets",
        help_text=_("<code>FileField</code> with <code>FileInput</code>")
    )
    f_image = models.ImageField(
        _("image"),
        blank=True,
        upload_to="widgets",
        help_text=_("Standard <code>ImageField</code>")
    )

    # Read-only & Hidden
    f_char_ro = models.CharField(
        _("char"),
        blank=True,
        default="Default value",
        max_length=128,
        help_text=_("Read-only <code>CharField</code>")
    )
    f_int_ro = models.IntegerField(
        _("int"),
        default=42,
        help_text=_("Read-only <code>IntegerField</code>")
    )
    f_text_ro = models.TextField(
        _("text"),
        blank=True,
        default="In hac habitasse platea dictumst. Curabitur nisi. "
                "Phasellus accumsan cursus velit. Suspendisse enim turpis, "
                "dictum sed, iaculis a, condimentum nec, nisi.",
        help_text=_("Read-only <code>TextField</code>")
    )
    f_hidden = models.CharField(
        _("hidden"),
        blank=True,
        max_length=128,
        help_text=_("Hidden <code>CharField</code>")
    )

    # Related
    f_fk = models.ForeignKey(
        Tag,
        verbose_name=_("FK"),
        related_name="+",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        help_text=_("Standard <code>ForeignKey</code>")
    )
    f_o2o = models.OneToOneField(
        Tag,
        verbose_name=_("One-to-One"),
        related_name="+",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text=_("Standard <code>OneToOneField</code>")
    )
    f_radio_fk = models.ForeignKey(
        Tag,
        verbose_name=_("Radio FK"),
        related_name="+",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text=_("Radio <code>ForeignKey</code>")
    )
    f_raw_id_fk = models.ForeignKey(
        Tag,
        verbose_name=_("Raw ID FK"),
        related_name="+",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text=_("Raw ID <code>ForeignKey</code>")
    )

    # Many-to-Many
    f_m2m = models.ManyToManyField(
        Tag,
        verbose_name=_("M2M"),
        related_name="+",
        blank=True,
        help_text=_("Standard <code>ManyToManyField</code>")
    )
    f_checkbox_m2m = models.ManyToManyField(
        Tag,
        verbose_name=_("Checkbox M2M"),
        related_name="+",
        blank=True,
        help_text=_("<code>ManyToManyField</code> with <code>AdminCheckboxSelectMultiple</code> widget")
    )
    f_checkbox_tree_m2m = models.ManyToManyField(
        Tag,
        verbose_name=_("Checkbox Tree M2M"),
        related_name="+",
        blank=True,
        help_text=_("<code>ManyToManyField</code> with <code>AdminCheckboxTree</code> widget")
    )
    f_horizontal_m2m = models.ManyToManyField(
        Tag,
        verbose_name=_("Horizontal M2M"),
        related_name="+",
        blank=True,
        help_text=_("Horizontal <code>ManyToManyField</code>")
    )
    f_radio_m2m = models.ManyToManyField(
        Tag,
        verbose_name=_("Radio M2M"),
        related_name="+",
        blank=True,
        help_text=_("Raw ID <code>ManyToManyField</code>")
    )

    # Autocomplete
    f_ac_fk = models.ForeignKey(
        Tag,
        verbose_name=_("Autocomplete FK"),
        related_name="+",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text=_("Autocomplete <code>ForeignKey</code>")
    )
    f_ac_o2o = models.OneToOneField(
        Tag,
        verbose_name=_("Autocomplete One-to-One"),
        related_name="+",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text=_("Autocomplete <code>OneToOneField</code>")
    )
    f_ac_m2m = models.ManyToManyField(
        Tag,
        verbose_name=_("Autocomplete M2M"),
        related_name="+",
        blank=True,
        help_text=_("Autocomplete <code>ManyToManyField</code>")
    )

    # Django-autocomplete-light
    dal_fk = models.ForeignKey(
        Tag,
        verbose_name=_("FK"),
        related_name="+",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text=_("DAL <code>ManyToManyField</code>")
    )
    dal_m2m = models.ManyToManyField(
        Tag,
        verbose_name=_("M2M"),
        related_name="+",
        blank=True,
        help_text=_("DAL <code>ManyToManyField</code>")
    )

    f_money = MoneyField(
        _("Money"),
        max_digits=10,
        null=True,
    )

    class Meta:
        verbose_name = _("widgets")
        verbose_name_plural = _("widgets")

    def __str__(self):
        return f"#{self.pk}"

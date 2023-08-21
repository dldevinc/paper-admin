from django.db import models
from django.utils.translation import gettext_lazy as _


class Person(models.Model):
    name = models.CharField(
        _("name"),
        max_length=128
    )
    email = models.EmailField(
        _("email"),
        blank=True
    )
    birthday = models.DateField(
        _("birthday"),
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = _("person")
        verbose_name_plural = _("persons")

    def __str__(self):
        return self.name


class Pet(models.Model):
    class Gender(models.TextChoices):
        MALE = "male", _("Male")
        FEMALE = "female", _("Female")

    owner = models.ForeignKey(
        Person,
        verbose_name=_("owner"),
        on_delete=models.CASCADE
    )
    name = models.CharField(
        _("name"),
        max_length=128
    )
    breed = models.CharField(
        _("breed"),
        max_length=128
    )
    gender = models.CharField(
        _("gender"),
        max_length=16,
        choices=Gender.choices,
        default=Gender.MALE
    )

    class Meta:
        verbose_name = _("pet")
        verbose_name_plural = _("pets")

    def __str__(self):
        return self.name

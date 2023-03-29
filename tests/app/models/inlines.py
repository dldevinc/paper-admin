from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils.text import Truncator
from django.utils.translation import gettext_lazy as _


class Author(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Book(models.Model):
    title = models.CharField(max_length=100)
    authors = models.ManyToManyField(Author, through="BookAuthor")

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.title

    def get_average_rating(self):
        reviews = Review.objects.filter(book=self).values("rating")
        if reviews:
            total_rating = sum(review["rating"] for review in reviews)
            return total_rating / len(reviews)
        else:
            return 0.0
    get_average_rating.short_description = _("Average Rating")


class BookAuthor(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)

    class Meta:
        verbose_name = _("Author")
        ordering = ["-id"]


class Review(models.Model):
    rating = models.PositiveSmallIntegerField(default=4, validators=[
        MinValueValidator(1), MaxValueValidator(5)
    ])
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return Truncator(self.text).words(20)

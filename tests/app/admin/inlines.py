from django.contrib import admin

from ..models import Author, Book, BookAuthor, Review


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ("name",)


class BookAuthorInline(admin.TabularInline):
    model = BookAuthor
    extra = 0


class ReviewInline(admin.StackedInline):
    model = Review
    extra = 0

    def get_form_classes(self, request, obj):
        if obj.rating == 5:
            return ["paper-card--success"]
        elif obj.rating >= 3:
            return ["paper-card--info"]
        elif obj.rating == 2:
            return ["paper-card--warning"]
        else:
            return ["paper-card--danger"]


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("title", "get_average_rating")
    search_fields = ("title",)
    inlines = [BookAuthorInline, ReviewInline]

    def get_row_classes(self, request, obj):
        avg_rating = obj.get_average_rating()
        if avg_rating >= 4.5:
            return ["table-success"]
        elif avg_rating >= 3.5:
            return ["table-info"]
        elif avg_rating >= 2:
            return ["table-warning"]
        else:
            return ["table-danger"]

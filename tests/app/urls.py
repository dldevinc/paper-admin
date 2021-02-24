from django.urls import path

from .views import IndexView, TagAutocomplete

app_name = "app"
urlpatterns = [
    path("ac-tag/", TagAutocomplete.as_view(), name="ac-tag"),
    path("", IndexView.as_view()),
]

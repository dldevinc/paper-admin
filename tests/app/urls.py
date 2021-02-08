from django.urls import path

from .views import IndexView

app_name = "app"
urlpatterns = [
    path("", IndexView.as_view()),
]

from django.core.validators import MaxValueValidator
from django.db import models
from django.utils.timezone import now


class User(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Group(models.Model):
    name = models.CharField(max_length=50)
    members = models.ManyToManyField(User, blank=True)

    def __str__(self):
        return self.name


class Message(models.Model):
    MESSAGE_TYPES = (
        ("text", "Text"),
        ("image", "Image"),
        ("video", "Video"),
    )

    sender = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name="sent_messages")
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="messages")
    type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default="text")
    text = models.TextField()
    rating = models.PositiveIntegerField(default=0, validators=[
        MaxValueValidator(5)
    ])
    edited = models.BooleanField(default=False, null=True)
    created_at = models.DateTimeField(default=now)

    def __str__(self):
        return "{} in {}: {}".format(
            self.sender,
            self.group,
            self.text
        )

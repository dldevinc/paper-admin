from django import forms

from .widgets import SplitDateTimeInput, SplitHiddenDateTimeWidget


class SplitDateTimeField(forms.SplitDateTimeField):
    widget = SplitDateTimeInput
    hidden_widget = SplitHiddenDateTimeWidget

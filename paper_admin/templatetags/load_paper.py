from django.template import library

from .. import conf

register = library.Library()


@register.simple_tag
def load_paper():
    return conf

from django.template import loader, library
from ..menu import get_menu, activate_menu

register = library.Library()


@register.simple_tag(takes_context=True)
def paper_menu(context):
    request = context.get('request')
    menu = get_menu(request)
    activate_menu(request, menu)
    return loader.render_to_string('paper_admin/_menu.html', {
        'level': 1,
        'items': menu,
        'parent': '#sidebar-menu',
    }, request=request)

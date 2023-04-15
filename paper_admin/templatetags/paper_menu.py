from django.template import library
from django.utils.safestring import mark_safe

from ..menu import Menu

register = library.Library()


@register.simple_tag(takes_context=True)
def paper_menu(context):
    request = context.get("request")
    menu = Menu(request)
    menu.build_tree()
    menu.resolve_tree(request)
    menu.activate_tree(request)
    return mark_safe(menu.render(request))


@register.simple_tag(takes_context=True)
def paper_menu_item(context, item):
    request = context.get("request")
    return mark_safe(item.render(request))

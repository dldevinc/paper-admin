import django
from django.contrib.admin.views.main import PAGE_VAR
from django.template import library, loader

register = library.Library()

DOT = '.'
ON_EACH_SIDE = 1
ON_ENDS = 3


@register.simple_tag()
def paper_pagination(cl):
    if not cl.pagination_required:
        return ""

    paginator, page_num = cl.paginator, cl.page_num

    # Use 1-indexed page numbers
    if django.VERSION < (3, 2):
        page_num += 1

    # If there are 5 or fewer pages, display links to every page.
    # Otherwise, do some fancy
    if paginator.num_pages < 5:
        page_range = list(range(1, paginator.num_pages + 1))
    else:
        page_range = []

        if ON_ENDS <= page_num <= paginator.num_pages - ON_ENDS + 1:
            page_range.append(DOT)
            page_range.extend(range(page_num - ON_EACH_SIDE, page_num + ON_EACH_SIDE + 1))
            page_range.append(DOT)
        elif page_num < ON_ENDS:
            page_range.extend(range(1, ON_ENDS + 1))
            page_range.append(DOT)
        elif page_num > paginator.num_pages - ON_ENDS + 1:
            page_range.append(DOT)
            page_range.extend(range(paginator.num_pages - ON_ENDS + 1, paginator.num_pages + 1))

    return loader.render_to_string("admin/pagination.html", {
        "cl": cl,
        "page_num": page_num,
        "page_range": page_range,
    })


@register.simple_tag
def page_url(cl, page_num):
    # Use 1-indexed page numbers
    if django.VERSION < (3, 2):
        page_num -= 1

    return cl.get_query_string({PAGE_VAR: page_num})

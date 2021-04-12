from django.contrib.admin.templatetags.admin_list import DOT
from django.contrib.admin.views.main import ALL_VAR, PAGE_VAR
from django.template import library, loader

ON_EACH_SIDE = 1
ON_ENDS = 2
register = library.Library()


@register.simple_tag()
def paper_pagination(cl):
    if not cl.pagination_required:
        return ""

    paginator, page_num = cl.paginator, cl.page_num

    # If there are 10 or fewer pages, display links to every page.
    # Otherwise, do some fancy
    if paginator.num_pages <= 6:
        page_range = list(range(paginator.num_pages))
    else:
        # Insert "smart" pagination links, so that there are always ON_ENDS
        # links at either end of the list of pages, and there are always
        # ON_EACH_SIDE links at either end of the "current page" link.
        page_range = []
        if page_num > (ON_EACH_SIDE + ON_ENDS):
            page_range.extend(range(0, ON_ENDS))
            page_range.append(DOT)
            page_range.extend(range(page_num - ON_EACH_SIDE, page_num + 1))
        else:
            page_range.extend(range(0, page_num + 1))
        if page_num < (paginator.num_pages - ON_EACH_SIDE - ON_ENDS - 1):
            page_range.extend(range(page_num + 1, page_num + ON_EACH_SIDE + 1))
            page_range.append(DOT)
            page_range.extend(range(paginator.num_pages - ON_ENDS, paginator.num_pages))
        else:
            page_range.extend(range(page_num + 1, paginator.num_pages))

    need_show_all_link = cl.can_show_all and not cl.show_all and cl.multi_page
    return loader.render_to_string("admin/pagination.html", {
        "cl": cl,
        "show_all_url": need_show_all_link and cl.get_query_string({ALL_VAR: ""}),
        "page_range": page_range,
    })


@register.simple_tag
def page_url(cl, i):
    return cl.get_query_string({PAGE_VAR: i})

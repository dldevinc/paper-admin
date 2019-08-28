const getMenuCollapseTrigger = function getMenuCollapseTrigger(navList) {
    const item = navList.closest('.nav-item');
    const itemChildrens = Array.from(item.children);
    const link = itemChildrens.find(function(element) {
        return element.classList.contains('nav-link');
    });
    return link && link.querySelector('.paper-icon-default');
};


$(document).on('show.bs.collapse', '#sidebar-menu', function(event) {
    const icon = getMenuCollapseTrigger(event.target);
    if (icon) {
        icon.classList.remove('fa-folder-o');
        icon.classList.add('fa-folder-open-o');
    }
}).on('hide.bs.collapse', '#sidebar-menu', function(event) {
    const icon = getMenuCollapseTrigger(event.target);
    if (icon) {
        icon.classList.remove('fa-folder-open-o');
        icon.classList.add('fa-folder-o');
    }
});

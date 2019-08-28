import "bootstrap";
import whenDomReady from "when-dom-ready";
import emitters from "./emitters";


/**
 * Инициализация виджетов Bootstrap
 * @param {Element} [root]
 */
function initBootstrap(root = document.body) {
    const $root = $(root);

    /**
     * Bootstrap dropdown
     * http://getbootstrap.com/docs/4.0/components/dropdowns/#via-javascript
     */
    let $dropdowns = $root.find('.dropdown-toggle');
    $root.is('.dropdown-toggle') && $dropdowns.add($root);
    $dropdowns.dropdown();

    /**
     * Bootstrap tooltips
     * http://getbootstrap.com/docs/4.0/components/tooltips/#example-enable-tooltips-everywhere
     */
    let $tooltips = $root.find('[data-toggle="tooltip"]');
    $root.is('[data-toggle="tooltip"]') && $tooltips.add($root);
    $tooltips.tooltip({
        delay: {
            show: 500,
            hide: 0
        }
    }).filter('[data-trigger="hover"]').on('click', function() {
        // FIX: при клике на кнопках сортировки, подсказки остаются висеть на прежнем месте
        $(this).tooltip('hide');
    });

    /**
     * Bootstrap popovers
     * http://getbootstrap.com/docs/4.0/components/popovers/#example-enable-popovers-everywhere
     */
    let $popovers = $root.find('[data-toggle="popover"]');
    $root.is('[data-toggle="popover"]') && $popovers.add($root);
    $popovers.popover();

    /**
     * Bootstrap collapse
     * http://getbootstrap.com/docs/4.0/components/collapse/#via-javascript
     */
    let $collapses = $root.find('.collapse');
    $root.is('.collapse') && $collapses.add($root);
    $collapses.collapse({
        toggle: false
    });
}


/**
 * Клик на иконку с подсказкой
 */
$(document).on('click.bs.popover', '.vHelpIcon[data-toggle="popover"][data-trigger="manual"]', function() {
    if (this.hasAttribute('aria-describedby')) {
        return false
    }

    let timer;
    const $that = $(this).popover('show');

    function hidePopover() {
        $that.popover('hide');
        timer && clearTimeout(timer);
        document.removeEventListener('click', closePopoverOnClick, true);
    }

    function closePopoverOnClick(event) {
        const popover = event.target.closest('.popover');
        if (!popover) {
            hidePopover();
        }
    }

    timer = setTimeout(hidePopover, 8000);
    document.addEventListener('click', closePopoverOnClick, true);
});


/**
 * Освобождение ресурсов Bootstrap.
 * @param {Element} [root]
 */
function releaseBootstrap(root = document.body) {
    const $root = $(root);

    $root.is('[data-toggle="tooltip"]') && $root.tooltip('hide');
    $root.find('[data-toggle="tooltip"]').tooltip('hide');

    $root.is('[data-toggle="popover"]') && $root.popover('hide');
    $root.find('[data-toggle="popover"]').popover('hide');
}


whenDomReady(initBootstrap);
emitters.dom.on('mutate', initBootstrap);
emitters.dom.on('release', releaseBootstrap);

import "bootstrap";
import Widget from "js/utilities/widget";


class DropdownWidget extends Widget {
    constructor(options) {
        super();
        this.opts = Object.assign({}, options);
    }

    _init(element) {
        if (!element.closest(".empty-form")) {
            $(element).dropdown(this.opts);
        }
    }
}


class PopoverWidget extends Widget {
    constructor(options) {
        super();
        this.opts = Object.assign({}, options);
    }

    _init(element) {
        if (!element.closest(".empty-form")) {
            $(element).popover(this.opts);
        }
    }

    _destroy(element) {
        $(element).popover("hide");
    }
}


class TooltipWidget extends Widget {
    constructor(options) {
        super();
        this.opts = Object.assign({}, options);
    }

    _init(element) {
        if (!element.closest(".empty-form")) {
            $(element).tooltip(this.opts).filter("[data-trigger=\"hover\"]").on("click", function() {
                // FIX: при клике на кнопках сортировки, подсказки остаются висеть на прежнем месте
                $(this).tooltip("hide");
            });
        }
    }

    _destroy(element) {
        $(element).tooltip("hide");
    }
}


class CollapseWidget extends Widget {
    constructor(options) {
        super();
        this.opts = Object.assign({}, options);
    }

    _init(element) {
        if (!element.closest(".empty-form")) {
            $(element).collapse(this.opts);
        }
    }
}


/**
 * Клик на иконку с подсказкой
 */
$(document).on("click.bs.popover", ".vHelpIcon[data-toggle=\"popover\"][data-trigger=\"manual\"]", function() {
    if (this.hasAttribute("aria-describedby")) {
        return false
    }

    let timer;
    const $that = $(this).popover("show");

    function hidePopover() {
        $that.popover("hide");
        timer && clearTimeout(timer);
        document.removeEventListener("click", closePopoverOnClick, true);
    }

    function closePopoverOnClick(event) {
        const popover = event.target.closest(".popover");
        if (!popover) {
            hidePopover();
        }
    }

    timer = setTimeout(hidePopover, 8000);
    document.addEventListener("click", closePopoverOnClick, true);
});


const bs_dropdown = new DropdownWidget();
bs_dropdown.observe(".dropdown-toggle");
bs_dropdown.initAll(".dropdown-toggle");


const bs_popover = new PopoverWidget();
bs_popover.observe("[data-toggle=\"popover\"]");
bs_popover.initAll("[data-toggle=\"popover\"]");


const bs_collapse = new CollapseWidget({
    toggle: false
});
bs_collapse.observe(".collapse");
bs_collapse.initAll(".collapse");


const bs_tooltip = new TooltipWidget({
    delay: {
        show: 500,
        hide: 0
    }
});
bs_tooltip.observe("[data-toggle=\"tooltip\"]");
bs_tooltip.initAll("[data-toggle=\"tooltip\"]");

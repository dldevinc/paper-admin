import "bootstrap";
import Widget from "js/utilities/widget";

class DropdownWidget extends Widget {
    constructor(options) {
        super();
        this.opts = Object.assign({}, options);
    }

    _init(element) {
        $(element).dropdown(this.opts);
    }
}

class PopoverWidget extends Widget {
    constructor(options) {
        super();
        this.opts = Object.assign({}, options);
    }

    _init(element) {
        $(element).popover(this.opts);
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
        $(element)
            .tooltip(this.opts)
            .filter('[data-trigger="hover"]')
            .on("click", function () {
                // FIX: при клике на кнопках сортировки, подсказки остаются висеть на прежнем месте
                $(this).tooltip("hide");
            });
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
        $(element).collapse(this.opts);
    }
}

const bs_dropdown = new DropdownWidget();
bs_dropdown.observe(".dropdown-toggle");
bs_dropdown.initAll(".dropdown-toggle");

const bs_popover = new PopoverWidget({
    delay: {
        show: 600,
        hide: 100
    }
});
bs_popover.observe('[data-toggle="popover"]');
bs_popover.initAll('[data-toggle="popover"]');

const bs_collapse = new CollapseWidget({
    toggle: false
});
bs_collapse.observe(".collapse");
bs_collapse.initAll(".collapse");

const bs_tooltip = new TooltipWidget({
    delay: {
        show: 600,
        hide: 100
    }
});
bs_tooltip.observe('[data-toggle="tooltip"]');
bs_tooltip.initAll('[data-toggle="tooltip"]');

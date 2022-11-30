import "bootstrap";
import Widget from "js/utilities/widget.js";

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
bs_dropdown.bind(".dropdown-toggle");
bs_dropdown.attach();

const bs_popover = new PopoverWidget({
    delay: {
        show: 600,
        hide: 100
    }
});
bs_popover.bind('[data-toggle="popover"]');
bs_popover.attach();

const bs_collapse = new CollapseWidget({
    toggle: false
});
bs_collapse.bind(".collapse");
bs_collapse.attach();

const bs_tooltip = new TooltipWidget({
    delay: {
        show: 600,
        hide: 100
    }
});
bs_tooltip.bind('[data-toggle="tooltip"]');
bs_tooltip.attach();

import "bootstrap";
import XClass from "data-xclass";

XClass.register("bs-dropdown", {
    init: function (element) {
        $(element).dropdown();
    },
    destroy: function (element) {
        $(element).dropdown("dispose");
    }
});

XClass.register("bs-popover", {
    init: function (element) {
        $(element).popover({
            delay: {
                show: 600,
                hide: 100
            }
        });
    },
    destroy: function (element) {
        $(element).popover("dispose");
    }
});

XClass.register("bs-tooltip", {
    init: function (element) {
        $(element)
            .tooltip({
                delay: {
                    show: 600,
                    hide: 100
                }
            })
            .filter('[data-trigger="hover"]')
            .on("click", function () {
                // FIX: при клике на кнопках сортировки, подсказки остаются висеть на прежнем месте
                $(this).tooltip("hide");
            });
    },
    destroy: function (element) {
        $(element).tooltip("dispose");
    }
});

XClass.register("bs-collapse", {
    init: function (element) {
        $(element).collapse({
            toggle: false
        });
    },
    destroy: function (element) {
        $(element).collapse("dispose");
    }
});

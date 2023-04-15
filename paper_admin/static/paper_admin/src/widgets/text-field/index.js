import autosize from "autosize";
import XClass from "data-xclass";

import "./index.scss";

XClass.register("text-field", {
    init: function (element) {
        const textarea = element.querySelector("textarea");
        textarea && autosize(textarea);
    },
    destroy: function (element) {
        const textarea = element.querySelector("textarea");
        textarea && autosize.destroy(textarea);
    }
});

// FIX bootstrap tabs
$(document).on("shown.bs.tab", event => {
    const tab_selector = event.target.getAttribute("href");
    const tab_pane = tab_selector && document.querySelector(tab_selector);
    if (tab_pane) {
        autosize.update(tab_pane.querySelectorAll(".text-field textarea"));
    }
});

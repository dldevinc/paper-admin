import autosize from "autosize";
import Widget from "js/utilities/widget.js";

import "./text-field.scss";

class AutosizeWidget extends Widget {
    _init(element) {
        const textarea = element.querySelector("textarea");
        if (!textarea) {
            return false;
        }

        autosize(textarea);
    }
}

// FIX bootstrap tabs
$(document).on("shown.bs.tab", event => {
    const tab_selector = event.target.getAttribute("href");
    const tab_pane = tab_selector && document.querySelector(tab_selector);
    if (tab_pane) {
        autosize.update(tab_pane.querySelectorAll(".text-field textarea"));
    }
});

const widget = new AutosizeWidget();
widget.bind(".text-field");
widget.attach();

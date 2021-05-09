import autosize from "autosize";
import Widget from "js/utilities/widget";

import "./text-field.scss";

class AutosizeWidget extends Widget {
    _init(element) {
        autosize(element);
    }

    _destroy(element) {
        $(element).multiSelect("destroy");
    }
}

// FIX bootstrap tabs
$(document).on("shown.bs.tab", function(event) {
    const tab_selector = event.target.getAttribute("href");
    const tab_pane = tab_selector && document.querySelector(tab_selector);
    if (tab_pane) {
        autosize.update(tab_pane.querySelectorAll(".text-field textarea"));
    }
});

const widget = new AutosizeWidget();
widget.observe(".text-field textarea");
widget.initAll(".text-field textarea");

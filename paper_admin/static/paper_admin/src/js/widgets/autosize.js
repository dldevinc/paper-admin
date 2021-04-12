import autosize from "autosize";
import Widget from "js/utilities/widget";


class AutosizeWidget extends Widget {
    _init(element) {
        if (!element.closest(".empty-form")) {
            autosize(element);
        }
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
        autosize.update(tab_pane.querySelectorAll("textarea[autosize]"));
    }
});


const autosizer = new AutosizeWidget();
autosizer.observe("textarea[autosize]");
autosizer.initAll("textarea[autosize]");

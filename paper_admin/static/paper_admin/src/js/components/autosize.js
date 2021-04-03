import autosize from "autosize";
import emitters from "js/components/emitters";


function initAutosize(root = document.body) {
    let selector = "textarea[autosize]";
    root.matches(selector) && autosize(root);
    autosize(root.querySelectorAll(selector));
}


initAutosize();

// FIX bootstrap tabs
$(document).on("shown.bs.tab", function(event) {
    const tab_selector = event.target.getAttribute("href");
    const tab_pane = tab_selector && document.querySelector(tab_selector);
    if (tab_pane) {
        autosize.update(tab_pane.querySelectorAll("textarea[autosize]"));
    }
});

emitters.dom.on("mutate", initAutosize);

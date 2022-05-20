import multi from "multi.js/dist/multi-es6.min.js";
import Widget from "js/utilities/widget";

// CSS
import "multi.js/src/multi.css";
import "./select-multiple-field.scss";

class MutliSelectWidget extends Widget {
    _init(element) {
        multi(element, {
            hide_empty_groups: true
        });
    }

    _destroy(element) {}
}

const widget = new MutliSelectWidget();
widget.observe(".select-multiple-field select");
widget.initAll(".select-multiple-field select");

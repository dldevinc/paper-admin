import multi from "multi.js/dist/multi-es6.min.js";
import Widget from "js/utilities/widget.js";

// CSS
import "multi.js/src/multi.css";
import "./select-multiple-field.scss";

class MutliSelectWidget extends Widget {
    _init(element) {
        const select = element.querySelector("select");
        if (!select) {
            return false;
        }

        multi(select, {
            hide_empty_groups: true
        });
    }
}

const widget = new MutliSelectWidget();
widget.bind(".select-multiple-field");
widget.attach();
